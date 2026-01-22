const Coupon = require("../models/CouponModel");
const { sanitizeString } = require("../lib/validation");

exports.createCoupon = async (req, res) => {
  try {
    console.log("🎫 [createCoupon] Request body:", req.body);
    
    const code = sanitizeString(req.body.code).toUpperCase();
    const user_id = sanitizeString(req.body.user_id);
    const discount_type = sanitizeString(req.body.discount_type);
    const value = Number(req.body.value);
    const min_order = Number(req.body.min_order || 0);
    const expires_at = req.body.expires_at ? new Date(req.body.expires_at) : null;
    const usage_limit = Number(req.body.usage_limit || 1);

    console.log("🎫 [createCoupon] Parsed values:", {
      code,
      user_id,
      discount_type,
      value,
      min_order,
      expires_at,
      usage_limit
    });

    if (!code || !discount_type || !value || !expires_at) {
      console.error("❌ [createCoupon] Missing required fields");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!["flat", "percent"].includes(discount_type)) {
      console.error("❌ [createCoupon] Invalid discount_type:", discount_type);
      return res.status(400).json({ success: false, message: "Invalid discount_type" });
    }
    if (value <= 0 || min_order < 0 || usage_limit <= 0) {
      console.error("❌ [createCoupon] Invalid values:", { value, min_order, usage_limit });
      return res.status(400).json({ success: false, message: "Invalid values" });
    }

    // Build coupon data object
    const couponData = {
      code,
      discount_type,
      value,
      min_order,
      expires_at,
      usage_limit,
    };

    // Only add user_id if it's not empty
    if (user_id) {
      couponData.user_id = user_id;
    }

    console.log("🎫 [createCoupon] Creating coupon with data:", couponData);

    const coupon = await Coupon.create(couponData);
    
    console.log("✅ [createCoupon] Coupon created successfully:", coupon);
    
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error("❌ [createCoupon] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const coupons = await Coupon.find({
      $and: [
        { is_active: true },
        { expires_at: { $gte: now } },
        {
          $or: [{ user_id: userId }, { user_id: { $exists: false } }],
        },
      ],
    });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    console.log("🎟️ [applyCoupon] Request body:", req.body);
    
    const code = sanitizeString(req.body.code).toUpperCase();
    const user_id = sanitizeString(req.body.user_id);
    const order_total = Number(req.body.order_total);

    console.log("🎟️ [applyCoupon] Parsed values:", {
      code,
      user_id,
      order_total,
      hasCode: !!code,
      hasUserId: !!user_id,
      hasOrderTotal: !!order_total && order_total > 0
    });

    if (!code || !user_id || !order_total) {
      console.error("❌ [applyCoupon] Missing required fields:", {
        code: !code ? "MISSING" : "OK",
        user_id: !user_id ? "MISSING" : "OK",
        order_total: !order_total ? "MISSING" : "OK"
      });
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields",
        debug: {
          code: !!code,
          user_id: !!user_id,
          order_total: !!order_total
        }
      });
    }

    const coupon = await Coupon.findOne({ code, is_active: true });
    if (!coupon) {
      console.error("❌ [applyCoupon] Coupon not found:", code);
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    
    console.log("✅ [applyCoupon] Coupon found:", {
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      min_order: coupon.min_order,
      expires_at: coupon.expires_at,
      used_count: coupon.used_count,
      usage_limit: coupon.usage_limit
    });
    
    if (coupon.user_id && String(coupon.user_id) !== user_id) {
      console.error("❌ [applyCoupon] Coupon not valid for user:", { couponUserId: coupon.user_id, requestUserId: user_id });
      return res.status(403).json({ success: false, message: "Coupon not valid for this user" });
    }
    if (coupon.expires_at < new Date()) {
      console.error("❌ [applyCoupon] Coupon expired:", { expires_at: coupon.expires_at, now: new Date() });
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }
    if (coupon.used_count >= coupon.usage_limit) {
      console.error("❌ [applyCoupon] Usage limit reached:", { used_count: coupon.used_count, usage_limit: coupon.usage_limit });
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }
    if (order_total < coupon.min_order) {
      console.error("❌ [applyCoupon] Order total below minimum:", { order_total, min_order: coupon.min_order });
      return res.status(400).json({ success: false, message: `Order total must be at least ₹${coupon.min_order}` });
    }

    let discount = 0;
    if (coupon.discount_type === "flat") {
      discount = coupon.value;
    } else {
      discount = Math.floor((order_total * coupon.value) / 100);
    }
    const new_total = Math.max(order_total - discount, 0);

    console.log("✅ [applyCoupon] Discount calculated:", { discount, new_total, order_total });

    res.status(200).json({ success: true, data: { discount, new_total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("user_id", "name email mobile").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = sanitizeString(updates.code).toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Toggle coupon active status
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.is_active = !coupon.is_active;
    await coupon.save();

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get coupon statistics
exports.getCouponStats = async (req, res) => {
  try {
    const now = new Date();
    
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ is_active: true });
    const expiredCoupons = await Coupon.countDocuments({ expires_at: { $lt: now } });
    const validCoupons = await Coupon.countDocuments({ 
      is_active: true, 
      expires_at: { $gte: now } 
    });

    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        validCoupons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
