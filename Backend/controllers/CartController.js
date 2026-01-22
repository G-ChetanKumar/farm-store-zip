const Cart = require("../models/CartModel");
const { sanitizeString } = require("../lib/validation");

const sanitizeNumber = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user });
    res.status(200).json({ success: true, data: cart || { user_id: req.user, items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setCart = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const normalizedItems = items.map((item) => ({
      product_id: sanitizeString(item.product_id),
      variant_id: sanitizeString(item.variant_id),
      qty: sanitizeNumber(item.qty) || 1,
      unit_price: sanitizeNumber(item.unit_price),
      original_price: sanitizeNumber(item.original_price),
      commission: sanitizeNumber(item.commission),
    }));

    for (const item of normalizedItems) {
      if (!isValidObjectId(item.product_id)) {
        return res.status(400).json({ success: false, message: "Invalid product_id" });
      }
      if (item.variant_id && !isValidObjectId(item.variant_id)) {
        return res.status(400).json({ success: false, message: "Invalid variant_id" });
      }
      if (item.qty <= 0) {
        return res.status(400).json({ success: false, message: "Invalid qty" });
      }
    }

    const cart = await Cart.findOneAndUpdate(
      { user_id: req.user },
      { items: normalizedItems },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const item = req.body;
    const productId = sanitizeString(item.product_id);
    const variantId = sanitizeString(item.variant_id);
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "product_id is required" });
    }
    if (variantId && !isValidObjectId(variantId)) {
      return res.status(400).json({ success: false, message: "Invalid variant_id" });
    }
    const qty = sanitizeNumber(item.qty) || 1;
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: "Invalid qty" });
    }

    const update = {
      $push: {
        items: {
          product_id: productId,
          variant_id: variantId,
          qty,
          unit_price: sanitizeNumber(item.unit_price),
          original_price: sanitizeNumber(item.original_price),
          commission: sanitizeNumber(item.commission),
        },
      },
    };

    const cart = await Cart.findOneAndUpdate(
      { user_id: req.user },
      update,
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemIndex } = req.params;
    const cart = await Cart.findOne({ user_id: req.user });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }
    const index = Number(itemIndex);
    if (Number.isNaN(index) || index < 0 || index >= cart.items.length) {
      return res.status(400).json({ success: false, message: "Invalid item index" });
    }
    cart.items.splice(index, 1);
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user_id: req.user },
      { items: [] },
      { new: true }
    );
    res.status(200).json({ success: true, data: cart || { user_id: req.user, items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkCart = async (req, res) => {
  try {
    const Product = require("../models/ProductModel");
    const cart = await Cart.findOne({ user_id: req.user });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({ 
        success: true, 
        valid: true,
        data: { user_id: req.user, items: [] },
        issues: []
      });
    }

    const issues = [];
    const validItems = [];

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      
      try {
        const product = await Product.findById(item.product_id);
        
        if (!product) {
          issues.push({
            index: i,
            product_id: item.product_id,
            issue: "product_not_found",
            message: "Product no longer exists"
          });
          continue;
        }

        const totalStock = typeof product.total_stock === "number" ? product.total_stock : 0;
        if (totalStock <= 0) {
          issues.push({
            index: i,
            product_id: item.product_id,
            issue: "out_of_stock",
            message: "Product is out of stock"
          });
          continue;
        }

        if (item.qty > totalStock) {
          issues.push({
            index: i,
            product_id: item.product_id,
            issue: "insufficient_stock",
            message: `Only ${totalStock} items available`,
            available_qty: totalStock
          });
        }

        let variantFound = false;
        let currentPrice = null;
        
        if (item.variant_id && product.package_qty) {
          const variant = product.package_qty.find(v => v._id && v._id.toString() === item.variant_id);
          if (variant) {
            variantFound = true;
            currentPrice = Number(variant.sell_price);
            
            if (currentPrice !== item.unit_price) {
              issues.push({
                index: i,
                product_id: item.product_id,
                variant_id: item.variant_id,
                issue: "price_changed",
                message: "Price has changed",
                old_price: item.unit_price,
                new_price: currentPrice
              });
            }
          }
        }

        if (item.variant_id && !variantFound) {
          issues.push({
            index: i,
            product_id: item.product_id,
            variant_id: item.variant_id,
            issue: "variant_not_found",
            message: "Product variant no longer available"
          });
          continue;
        }

        validItems.push({
          ...item.toObject ? item.toObject() : item,
          product_title: product.title,
          current_stock: totalStock,
          current_price: currentPrice || item.unit_price
        });
      } catch (err) {
        issues.push({
          index: i,
          product_id: item.product_id,
          issue: "validation_error",
          message: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      valid: issues.length === 0,
      data: {
        user_id: req.user,
        items: validItems,
        total_items: validItems.length
      },
      issues: issues,
      has_issues: issues.length > 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
