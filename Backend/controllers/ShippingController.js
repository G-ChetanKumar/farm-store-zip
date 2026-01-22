const ShippingConfig = require("../models/ShippingConfigModel");
const Order = require("../models/OrderModel");

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Get all shipping configurations
exports.getShippingConfigs = async (req, res) => {
  try {
    const configs = await ShippingConfig.find().sort({ createdAt: -1 });
    res.status(200).json(configs);
  } catch (error) {
    console.error("[Shipping] Error fetching configs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get shipping config by pincode
exports.getShippingByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    const config = await ShippingConfig.findOne({ pincode, is_serviceable: true });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Delivery not available for this pincode",
        serviceable: false
      });
    }
    
    res.status(200).json({
      success: true,
      data: config,
      serviceable: true
    });
  } catch (error) {
    console.error("[Shipping] Error fetching by pincode:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get shipping statistics
exports.getShippingStats = async (req, res) => {
  try {
    const totalLocations = await ShippingConfig.countDocuments();
    const serviceableLocations = await ShippingConfig.countDocuments({ is_serviceable: true });
    
    const statesResult = await ShippingConfig.distinct("state");
    const totalStates = statesResult.length;
    
    const avgFeeResult = await ShippingConfig.aggregate([
      { $match: { is_serviceable: true } },
      {
        $group: {
          _id: null,
          avgFee: { $avg: "$shipping_fee" }
        }
      }
    ]);
    
    const averageShippingFee = avgFeeResult.length > 0 ? avgFeeResult[0].avgFee : 0;
    
    res.status(200).json({
      totalLocations,
      serviceableLocations,
      totalStates,
      averageShippingFee: Math.round(averageShippingFee * 100) / 100,
    });
  } catch (error) {
    console.error("[Shipping] Error fetching stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all states
exports.getStates = async (req, res) => {
  try {
    res.status(200).json(INDIAN_STATES);
  } catch (error) {
    console.error("[Shipping] Error fetching states:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get districts by state
exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await ShippingConfig.distinct("district", { state });
    res.status(200).json(districts);
  } catch (error) {
    console.error("[Shipping] Error fetching districts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create shipping configuration
exports.createShippingConfig = async (req, res) => {
  try {
    const {
      pincode,
      location_name,
      state,
      district,
      city,
      delivery_time,
      shipping_fee,
      delivery_mode,
      is_serviceable,
      is_cod_available,
      store_type,
      min_order_value,
      free_shipping_above,
      estimated_delivery_days,
      notes
    } = req.body;
    
    // Validation
    if (!pincode || !location_name || !state || !district || !city) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: pincode, location_name, state, district, city"
      });
    }
    
    // Check if pincode already exists
    const existing = await ShippingConfig.findOne({ pincode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Shipping configuration for pincode ${pincode} already exists`
      });
    }
    
    const config = await ShippingConfig.create({
      pincode,
      location_name,
      state,
      district,
      city,
      delivery_time,
      shipping_fee: Number(shipping_fee) || 0,
      delivery_mode,
      is_serviceable: is_serviceable !== false,
      is_cod_available: is_cod_available !== false,
      store_type: store_type || "all",
      min_order_value: Number(min_order_value) || 0,
      free_shipping_above: free_shipping_above ? Number(free_shipping_above) : null,
      estimated_delivery_days: estimated_delivery_days || { min: 3, max: 5 },
      notes: notes || ""
    });
    
    console.log("[Shipping] Config created:", config.pincode);
    res.status(201).json({
      success: true,
      data: config,
      message: "Shipping configuration created successfully"
    });
  } catch (error) {
    console.error("[Shipping] Error creating config:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update shipping configuration
exports.updateShippingConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await ShippingConfig.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Shipping configuration not found"
      });
    }
    
    console.log("[Shipping] Config updated:", config.pincode);
    res.status(200).json({
      success: true,
      data: config,
      message: "Shipping configuration updated successfully"
    });
  } catch (error) {
    console.error("[Shipping] Error updating config:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle serviceable status
exports.toggleServiceable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await ShippingConfig.findById(id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Shipping configuration not found"
      });
    }
    
    config.is_serviceable = !config.is_serviceable;
    await config.save();
    
    console.log("[Shipping] Serviceable toggled:", config.pincode, config.is_serviceable);
    res.status(200).json({
      success: true,
      data: config,
      message: `Delivery ${config.is_serviceable ? "enabled" : "disabled"} for ${config.location_name}`
    });
  } catch (error) {
    console.error("[Shipping] Error toggling serviceable:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete shipping configuration
exports.deleteShippingConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await ShippingConfig.findByIdAndDelete(id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Shipping configuration not found"
      });
    }
    
    console.log("[Shipping] Config deleted:", config.pincode);
    res.status(200).json({
      success: true,
      message: "Shipping configuration deleted successfully"
    });
  } catch (error) {
    console.error("[Shipping] Error deleting config:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk import shipping configurations
exports.bulkImport = async (req, res) => {
  try {
    const { configs } = req.body;
    
    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data: configs must be a non-empty array"
      });
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };
    
    for (const configData of configs) {
      try {
        const existing = await ShippingConfig.findOne({ pincode: configData.pincode });
        
        if (existing) {
          await ShippingConfig.findByIdAndUpdate(existing._id, configData);
          results.updated++;
        } else {
          await ShippingConfig.create(configData);
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          pincode: configData.pincode,
          error: error.message
        });
      }
    }
    
    console.log("[Shipping] Bulk import completed:", results);
    res.status(200).json({
      success: true,
      data: results,
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`
    });
  } catch (error) {
    console.error("[Shipping] Error in bulk import:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ORDER-BASED SHIPPING MANAGEMENT
// ============================================

// Get all orders with shipping details
exports.getShippingOrders = async (req, res) => {
  try {
    console.log("[Shipping] Fetching orders for shipping management...");
    
    const orders = await Order.find()
      .populate({
        path: 'products.product_id',
        select: 'title name product_name sell_price mrp_price image'
      })
      .populate({
        path: 'user_id',
        select: 'name email mobile user_type'
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform for shipping view
    const shippingData = orders.map(order => {
      return {
        _id: order._id,
        order_id: order._id,
        order_date: order.date,
        
        // Customer details
        customer_name: order.name,
        customer_phone: order.phone,
        customer_email: order.user_id?.email || 'N/A',
        user_type: order.user_id?.user_type || 'N/A',
        
        // Shipping address
        shipping_address: order.address,
        pincode: order.pincode,
        
        // Order status
        order_status: order.order_status || 'pending',
        
        // Payment details
        payment_method: order.payment_method || 'N/A',
        payment_status: order.razorpay_payment_status || 'pending',
        transaction_id: order.transaction_id,
        total_amount: order.total_amount,
        
        // Delivery details
        delivery_type: order.delivery_mode || order.delivery_type || 'home_delivery',
        
        // Product count
        product_count: order.products.length,
        
        // Timestamps
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      };
    });
    
    console.log(`[Shipping] Found ${shippingData.length} orders for shipping`);
    res.status(200).json({
      success: true,
      data: shippingData
    });
  } catch (error) {
    console.error("[Shipping] Error fetching shipping orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get shipping statistics from actual orders
exports.getShippingOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const pendingOrders = await Order.countDocuments({ order_status: 'pending' });
    const inTransitOrders = await Order.countDocuments({ order_status: 'shipment' });
    const deliveredOrders = await Order.countDocuments({ order_status: 'delivered' });
    
    // Paid vs COD
    const onlinePayments = await Order.countDocuments({ payment_method: 'online' });
    const codPayments = await Order.countDocuments({ payment_method: 'cod' });
    
    // Revenue by delivery status
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: "$order_status",
          total_revenue: { $sum: "$total_amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Top delivery locations
    const topLocations = await Order.aggregate([
      {
        $group: {
          _id: "$pincode",
          count: { $sum: 1 },
          total_revenue: { $sum: "$total_amount" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders,
        onlinePayments,
        codPayments,
        revenueByStatus: revenueResult,
        topDeliveryLocations: topLocations
      }
    });
  } catch (error) {
    console.error("[Shipping] Error fetching order stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update shipping/delivery status for an order
exports.updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      order_status, 
      tracking_number,
      delivery_partner,
      estimated_delivery,
      delivery_notes 
    } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      {
        order_status,
        tracking_number,
        delivery_partner,
        estimated_delivery,
        delivery_notes,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    console.log("[Shipping] Order status updated:", order._id, order_status);
    res.status(200).json({
      success: true,
      data: order,
      message: "Shipping status updated successfully"
    });
  } catch (error) {
    console.error("[Shipping] Error updating shipping status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
