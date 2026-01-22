const Product = require("../models/ProductModel");
const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");

exports.createProduct = async (req, res) => {
  try {
    const {
      super_cat_id,
      title,
      sub_title,
      description,
      chemical_content,
      technical_name,
      mode_of_action,
      product_form,
      packaging,
      formulation,
      usage_method,
      features_benefits,
      modes_of_use,
      method_of_application,
      recommendations,
      category_id,
      sub_category_id,
      brand_id,
      crop_id,
      pest_id,
      mfg_by,
      package_qty,
      retailer_package_qty,
      agent_commission,
      delivery_speed,
      total_stock,
      rating_avg,
      rating_count
    } = req.body;
    const allowedDelivery = new Set(["30-45 min", "same day", "tomorrow", "within 3 days", "within 1 week"]);
    if (delivery_speed && !allowedDelivery.has(delivery_speed)) {
      return res.status(400).json({ message: "Invalid delivery_speed" });
    }

    const files = req.files;
    if (!files || files.length !== 3 || !title || !sub_title || !description || !super_cat_id) {
      return res.status(400).json({ message: "All fields and exactly 3 images are required" });
    }

    // Upload all images to S3
    const images = await Promise.all(
      files.map(async (file, index) => {
        const s3Response = await uploadFileToS3(file);
        return {
          fileName: file.originalname,
          imageUrl: s3Response.url,
          imagePublicId: s3Response.key,
          sequence: index + 1,
        };
      })
    );

    const parsedPackageQty =
      typeof package_qty === "string" ? JSON.parse(package_qty) : package_qty;

    const parsedRetailerPackageQty =
      typeof retailer_package_qty === "string" ? JSON.parse(retailer_package_qty) : retailer_package_qty;

    const product = new Product({
      images,
      super_cat_id: super_cat_id,
      title,
      sub_title,
      description,
      chemical_content,
      technical_name,
      mode_of_action,
      product_form,
      packaging,
      formulation,
      usage_method,
      features_benefits,
      modes_of_use,
      method_of_application,
      recommendations,
      category_id,
      sub_category_id,
      brand_id,
      crop_id,
      pest_id,
      mfg_by,
      package_qty: parsedPackageQty,
      retailer_package_qty: parsedRetailerPackageQty,
      agent_commission,
      delivery_speed,
      total_stock,
      rating_avg,
      rating_count
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveVariantsForRole = (product, userType) => {
  if (userType === "Agri-Retailer") {
    return Array.isArray(product.retailer_package_qty) ? product.retailer_package_qty : [];
  }
  return Array.isArray(product.package_qty) ? product.package_qty : [];
};

const buildPricingSummary = (variants, agentCommission) => {
  const first = variants[0];
  if (!first) {
    return { effective_price: null, original_price: null, commission: null };
  }
  const mrp = Number(first.mrp_price || 0);
  const sell = Number(first.sell_price || 0);
  let commission = null;
  if (agentCommission !== undefined && agentCommission !== null) {
    const percent = Number(agentCommission);
    if (!Number.isNaN(percent)) {
      commission = Math.round((sell * percent) / 100);
    }
  }
  return { effective_price: sell, original_price: mrp, commission };
};

exports.getAllProduct = async (req, res) => {
  try {
    const {
      category_id,
      brand_id,
      crop_id,
      pest_id,
      delivery_speed,
      formulation,
      usage_method,
      mode_of_action,
      product_form,
      packaging,
      in_stock,
      min_price,
      max_price,
      min_rating,
      discount_min,
      discount_max,
      sort,
      search,
      user_type,
    } = req.query;

    const filters = {};
    const allowedSorts = new Set(["price_low", "price_high", "rating", "az", "za"]);
    const allowedDelivery = new Set(["30-45 min", "same day", "tomorrow", "within 3 days", "within 1 week"]);
    const inStockValues = new Set(["true", "false"]);

    if (category_id) filters.category_id = category_id;
    if (brand_id) filters.brand_id = brand_id;
    if (crop_id) filters.crop_id = crop_id;
    if (pest_id) filters.pest_id = pest_id;
    if (delivery_speed) {
      if (!allowedDelivery.has(delivery_speed)) {
        return res.status(400).json({ message: "Invalid delivery_speed" });
      }
      filters.delivery_speed = delivery_speed;
    }
    if (formulation) filters.formulation = formulation;
    if (usage_method) filters.usage_method = usage_method;
    if (mode_of_action) filters.mode_of_action = mode_of_action;
    if (product_form) filters.product_form = product_form;
    if (packaging) filters.packaging = packaging;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { sub_title: { $regex: search, $options: "i" } },
        { technical_name: { $regex: search, $options: "i" } },
      ];
    }

    if (in_stock && !inStockValues.has(in_stock)) {
      return res.status(400).json({ message: "Invalid in_stock value" });
    }
    if (sort && !allowedSorts.has(sort)) {
      return res.status(400).json({ message: "Invalid sort value" });
    }

    const products = await Product.find(filters);

    const filtered = products.filter((product) => {
      const totalStock = typeof product.total_stock === "number" ? product.total_stock : 0;
      const isSoldOut = totalStock <= 0;
      if (in_stock === "true" && isSoldOut) return false;
      if (in_stock === "false" && !isSoldOut) return false;

      const firstVariant = Array.isArray(product.package_qty) ? product.package_qty[0] : null;
      const mrp = firstVariant ? Number(firstVariant.mrp_price) : NaN;
      const sell = firstVariant ? Number(firstVariant.sell_price) : NaN;
      if (min_price && !Number.isNaN(sell) && sell < Number(min_price)) return false;
      if (max_price && !Number.isNaN(sell) && sell > Number(max_price)) return false;

      const rating = typeof product.rating_avg === "number" ? product.rating_avg : 0;
      if (min_rating && rating < Number(min_rating)) return false;

      const discount = !Number.isNaN(mrp) && mrp > 0 && !Number.isNaN(sell)
        ? Math.round(((mrp - sell) / mrp) * 100)
        : 0;
      if (discount_min && discount < Number(discount_min)) return false;
      if (discount_max && discount > Number(discount_max)) return false;

      return true;
    });

    const sorted = filtered.sort((a, b) => {
      if (sort === "price_low") {
        return Number(a.package_qty?.[0]?.sell_price || 0) - Number(b.package_qty?.[0]?.sell_price || 0);
      }
      if (sort === "price_high") {
        return Number(b.package_qty?.[0]?.sell_price || 0) - Number(a.package_qty?.[0]?.sell_price || 0);
      }
      if (sort === "rating") {
        return Number(b.rating_avg || 0) - Number(a.rating_avg || 0);
      }
      if (sort === "az") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }
      if (sort === "za") {
        return String(b.title || "").localeCompare(String(a.title || ""));
      }
      return 0;
    });

    const withStock = sorted.map((product) => {
      const totalStock = typeof product.total_stock === "number" ? product.total_stock : 0;
      const isSoldOut = totalStock <= 0;
      const variants = resolveVariantsForRole(product, user_type);
      const pricing = buildPricingSummary(
        variants,
        user_type === "Agent" ? product.agent_commission : null
      );
      return {
        ...product.toObject(),
        is_sold_out: isSoldOut,
        variants,
        effective_price: pricing.effective_price,
        original_price: pricing.original_price,
        commission: pricing.commission,
      };
    });

    res.status(200).json(withStock);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub products" });
  }
};

exports.getByIdProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalStock = typeof product.total_stock === "number" ? product.total_stock : 0;
    const isSoldOut = totalStock <= 0;
    const userType = req.query.user_type;
    const variants = resolveVariantsForRole(product, userType);
    const pricing = buildPricingSummary(
      variants,
      userType === "Agent" ? product.agent_commission : null
    );
    res.status(200).json({
      ...product.toObject(),
      is_sold_out: isSoldOut,
      variants,
      effective_price: pricing.effective_price,
      original_price: pricing.original_price,
      commission: pricing.commission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      super_cat_id,
      title,
      sub_title,
      description,
      chemical_content,
      technical_name,
      mode_of_action,
      product_form,
      packaging,
      formulation,
      usage_method,
      features_benefits,
      modes_of_use,
      method_of_application,
      recommendations,
      category_id,
      sub_category_id,
      brand_id,
      crop_id,
      pest_id,
      mfg_by,
      package_qty,
      retailer_package_qty,
      agent_commission,
      delivery_speed,
      total_stock,
      rating_avg,
      rating_count
    } = req.body;
    const allowedDelivery = new Set(["30-45 min", "same day", "tomorrow", "within 3 days", "within 1 week"]);
    if (delivery_speed && !allowedDelivery.has(delivery_speed)) {
      return res.status(400).json({ message: "Invalid delivery_speed" });
    }

    const files = req.files;
    const updateData = {
      super_cat_id,
      title,
      sub_title,
      description,
      chemical_content,
      technical_name,
      mode_of_action,
      product_form,
      packaging,
      formulation,
      usage_method,
      features_benefits,
      modes_of_use,
      method_of_application,
      recommendations,
      category_id,
      sub_category_id,
      brand_id,
      crop_id,
      pest_id,
      mfg_by,
      agent_commission,
      delivery_speed,
      total_stock,
      rating_avg,
      rating_count
    };

    if (package_qty) {
      updateData.package_qty =
        typeof package_qty === "string" ? JSON.parse(package_qty) : package_qty;
    }
    if (retailer_package_qty) {
      updateData.retailer_package_qty =
        typeof retailer_package_qty === "string" ? JSON.parse(retailer_package_qty) : retailer_package_qty;
    }
    if (files && files.length === 3) {
      // Optionally, you may want to delete old images from S3 here
      updateData.images = await Promise.all(
        files.map(async (file, index) => {
          const s3Response = await uploadFileToS3(file);
          return {
            fileName: file.originalname,
            imageUrl: s3Response.url,
            imagePublicId: s3Response.key,
            sequence: index + 1,
          };
        })
      );
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.imagePublicId) {
      await deleteFileFromS3(product.imagePublicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
