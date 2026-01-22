const MembershipPlan = require("../models/MembershipPlanModel");
const MembershipSubscription = require("../models/MembershipSubscriptionModel");
const User = require("../models/UserModel");
const Admin = require("../models/AdminModel");

const isRetailerOrAgent = (userType) =>
  userType === "Agri-Retailer" || userType === "Agent";

exports.createPlan = async (req, res) => {
  try {
    const { name, price, cashback_percent, gst_percent, validity_purchases, validity_days, can_club_coupons } = req.body;
    if (!name || !price || !cashback_percent || !validity_purchases || !validity_days) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (Number(price) <= 0 || Number(cashback_percent) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price or cashback_percent" });
    }
    const plan = await MembershipPlan.create({
      name,
      price: Number(price),
      cashback_percent: Number(cashback_percent),
      gst_percent: gst_percent || 18,
      validity_purchases: Number(validity_purchases),
      validity_days: Number(validity_days),
      can_club_coupons: can_club_coupons === true,
    });
    
    console.log("[Membership] Plan created:", plan.name);
    res.status(201).json({ success: true, data: plan, message: "Plan created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    // Show all plans for admin, only active for users
    const { showAll } = req.query;
    const filter = showAll === "true" ? {} : { is_active: true };
    
    const plans = await MembershipPlan.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, cashback_percent, gst_percent, validity_purchases, validity_days, can_club_coupons, is_active } = req.body;
    
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    
    // Update fields
    if (name !== undefined) plan.name = name;
    if (price !== undefined) plan.price = Number(price);
    if (cashback_percent !== undefined) plan.cashback_percent = Number(cashback_percent);
    if (gst_percent !== undefined) plan.gst_percent = Number(gst_percent);
    if (validity_purchases !== undefined) plan.validity_purchases = Number(validity_purchases);
    if (validity_days !== undefined) plan.validity_days = Number(validity_days);
    if (can_club_coupons !== undefined) plan.can_club_coupons = can_club_coupons === true;
    if (is_active !== undefined) plan.is_active = is_active === true;
    
    await plan.save();
    
    console.log("[Membership] Plan updated:", plan.name);
    res.status(200).json({ success: true, data: plan, message: "Plan updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    
    // Check if any active subscriptions exist for this plan
    const activeSubscriptions = await MembershipSubscription.countDocuments({
      plan_id: id,
      status: "active",
      expires_at: { $gte: new Date() }
    });
    
    if (activeSubscriptions > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete plan. ${activeSubscriptions} active subscription(s) exist. Please deactivate the plan instead.` 
      });
    }
    
    await MembershipPlan.findByIdAndDelete(id);
    
    console.log("[Membership] Plan deleted:", plan.name);
    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    
    plan.is_active = !plan.is_active;
    await plan.save();
    
    console.log("[Membership] Plan status toggled:", plan.name, "is_active:", plan.is_active);
    res.status(200).json({ 
      success: true, 
      data: plan, 
      message: `Plan ${plan.is_active ? "activated" : "deactivated"} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { plan_id } = req.body;
    if (!plan_id) {
      return res.status(400).json({ success: false, message: "plan_id is required" });
    }
    
    // SECURITY CHECK 1: User must exist
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // SECURITY CHECK 2: ONLY Farmers can subscribe
    // Block Agents and Agri-Retailers explicitly
    if (isRetailerOrAgent(user.user_type)) {
      console.log("[Membership] BLOCKED: User type", user.user_type, "attempted to subscribe");
      return res.status(403).json({ 
        success: false, 
        message: "Memberships are ONLY available for Farmers. Your account type: " + user.user_type 
      });
    }
    
    // Triple-check: Must be Farmer
    if (user.user_type !== "Farmer") {
      console.log("[Membership] BLOCKED: Non-Farmer user type", user.user_type);
      return res.status(403).json({ 
        success: false, 
        message: "Memberships are strictly for Farmer accounts only" 
      });
    }

    // SECURITY CHECK 3: Check for existing active subscription
    const existingSubscription = await MembershipSubscription.findOne({
      user_id: user._id,
      status: "active",
      expires_at: { $gte: new Date() }
    });
    
    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        message: "You already have an active membership. Please wait for it to expire before purchasing a new one." 
      });
    }
    
    // SECURITY CHECK 4: Plan must exist and be active
    const plan = await MembershipPlan.findById(plan_id);
    if (!plan || !plan.is_active) {
      return res.status(404).json({ success: false, message: "Plan not found or not available" });
    }
    if (plan.validity_days <= 0 || plan.validity_purchases <= 0) {
      return res.status(400).json({ success: false, message: "Invalid plan configuration" });
    }

    // Calculate expiry date
    const expiresAt = new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000);
    
    // Create subscription
    const subscription = await MembershipSubscription.create({
      user_id: user._id,
      plan_id: plan._id,
      purchases_left: plan.validity_purchases,
      expires_at: expiresAt,
      status: "active"
    });
    
    console.log("[Membership] New subscription created for user:", user._id, "plan:", plan.name);
    
    res.status(201).json({ 
      success: true, 
      data: subscription,
      message: `Successfully subscribed to ${plan.name} plan!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("[Membership] 🔍 Getting subscription for user:", userId);
    
    // Check both User and Admin collections
    let user = await User.findById(userId);
    let userType = "User";
    
    if (!user) {
      console.log("[Membership] 🔍 Not in User collection, checking Admin...");
      user = await Admin.findById(userId);
      if (user) {
        userType = "admin";
        console.log("[Membership] ✅ Found admin user");
      }
    }
    
    if (!user) {
      console.log("[Membership] ❌ User not found in any collection");
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log("[Membership] ✅ User found, type:", userType);
    
    // Check for active subscription
    const subscription = await MembershipSubscription.findOne({
      user_id: userId,
      status: "active",
      expires_at: { $gte: new Date() },
      purchases_left: { $gt: 0 }
    }).populate("plan_id");
    
    if (!subscription) {
      console.log("[Membership] ℹ️ No active subscription found");
      return res.status(404).json({ 
        success: false, 
        message: "No active membership found" 
      });
    }
    
    console.log("[Membership] ✅ Active subscription found:", subscription._id);
    
    // Return subscription with user type
    res.status(200).json({ 
      success: true, 
      data: subscription,
      user_type: userType
    });
  } catch (error) {
    console.error("[Membership] ❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subscriptions (Admin only)
exports.getAllSubscriptions = async (req, res) => {
  try {
    console.log("[Membership] 🔍 Getting all subscriptions (Admin)");
    
    const { status, limit, skip } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Get subscriptions with user and plan details
    const subscriptions = await MembershipSubscription.find(query)
      .populate("plan_id", "name price cashback_percent validity_days validity_purchases")
      .populate("user_id", "name email mobile user_type")
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100)
      .skip(skip ? parseInt(skip) : 0);
    
    // Get statistics
    const stats = {
      total: await MembershipSubscription.countDocuments(),
      active: await MembershipSubscription.countDocuments({ 
        status: "active",
        expires_at: { $gte: new Date() }
      }),
      expired: await MembershipSubscription.countDocuments({ 
        status: "active",
        expires_at: { $lt: new Date() }
      }),
      cancelled: await MembershipSubscription.countDocuments({ status: "cancelled" })
    };
    
    console.log("[Membership] ✅ Found subscriptions:", subscriptions.length);
    
    res.status(200).json({ 
      success: true, 
      data: subscriptions,
      stats: stats,
      count: subscriptions.length
    });
  } catch (error) {
    console.error("[Membership] ❌ Error fetching subscriptions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update subscription (Admin only)
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchases_left, expires_at, status } = req.body;
    
    console.log("[Membership] 📝 Updating subscription:", id);
    
    const subscription = await MembershipSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    
    // Update fields
    if (purchases_left !== undefined) subscription.purchases_left = purchases_left;
    if (expires_at) subscription.expires_at = new Date(expires_at);
    if (status) subscription.status = status;
    
    if (status === "cancelled") {
      subscription.cancelled_at = new Date();
      subscription.cancelled_reason = "Cancelled by admin";
    }
    
    await subscription.save();
    
    console.log("[Membership] ✅ Subscription updated successfully");
    
    res.status(200).json({ 
      success: true, 
      message: "Subscription updated successfully",
      data: subscription
    });
  } catch (error) {
    console.error("[Membership] ❌ Error updating subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel subscription (Admin only)
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("[Membership] 🚫 Cancelling subscription:", id);
    
    const subscription = await MembershipSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    
    subscription.status = "cancelled";
    subscription.cancelled_at = new Date();
    subscription.cancelled_reason = "Cancelled by admin";
    
    await subscription.save();
    
    console.log("[Membership] ✅ Subscription cancelled successfully");
    
    res.status(200).json({ 
      success: true, 
      message: "Subscription cancelled successfully",
      data: subscription
    });
  } catch (error) {
    console.error("[Membership] ❌ Error cancelling subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
