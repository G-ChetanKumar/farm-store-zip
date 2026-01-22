const Razorpay = require("razorpay");
const crypto = require("crypto");
const MembershipPlan = require("../models/MembershipPlanModel");
const MembershipSubscription = require("../models/MembershipSubscriptionModel");
const User = require("../models/UserModel");
const Admin = require("../models/AdminModel");

// Initialize Razorpay - Remove quotes if present in .env
const cleanKeyId = (process.env.RAZORPAY_KEY_ID || "rzp_test_dummy").replace(/"/g, '');
const cleanKeySecret = (process.env.RAZORPAY_KEY_SECRET || "dummy_secret").replace(/"/g, '');

console.log('[Razorpay] Initializing with credentials...');
console.log('[Razorpay] KEY_ID set:', !!cleanKeyId);
console.log('[Razorpay] KEY_SECRET set:', !!cleanKeySecret);
console.log('[Razorpay] KEY_ID length:', cleanKeyId.length);

const razorpay = new Razorpay({
  key_id: cleanKeyId,
  key_secret: cleanKeySecret,
});

/**
 * Create Razorpay order for membership payment
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    console.log("[Payment] 📥 Received payment order request");
    console.log("[Payment] 📥 Request body:", req.body);
    console.log("[Payment] 📥 User ID from token:", req.user);
    
    const userId = req.user; // From auth middleware

    // ✅ CRITICAL: Verify user is authenticated
    if (!userId) {
      console.error("[Payment] ❌ No user ID in token - authentication required");
      return res.status(401).json({ 
        success: false, 
        message: "Please login to subscribe to a membership plan",
        code: "AUTHENTICATION_REQUIRED"
      });
    }

    const { plan_id } = req.body;

    if (!plan_id) {
      console.error("[Payment] ❌ No plan_id provided");
      return res.status(400).json({ success: false, message: "plan_id is required" });
    }

    // Get user details - check both User and Admin collections
    console.log("[Payment] 🔍 Looking up user with ID:", userId);
    console.log("[Payment] 🔍 User type from token:", req.user_type);
    
    let user = null;
    let userType = req.user_type || "User";
    
    // Try User collection first
    user = await User.findById(userId);
    
    // If not found, try Admin collection
    if (!user) {
      console.log("[Payment] 🔍 Not in User collection, checking Admin collection...");
      user = await Admin.findById(userId);
      if (user) {
        console.log("[Payment] ✅ Found in Admin collection");
        userType = "admin";
      }
    }
    
    if (!user) {
      console.error("[Payment] ❌ User not found in either User or Admin collection");
      console.error("[Payment] ❌ User ID:", userId);
      return res.status(404).json({ 
        success: false, 
        message: "User not found. Please login again." 
      });
    }

    console.log("[Payment] ✅ User found:", user.name, "Type:", userType);
    
    // Memberships now available for all user types
    console.log("[Payment] ✅ Creating membership order for user type:", userType);

    // Get plan details
    console.log("[Payment] 🔍 Looking up plan with ID:", plan_id);
    const plan = await MembershipPlan.findById(plan_id);
    if (!plan) {
      console.error("[Payment] ❌ Plan not found for ID:", plan_id);
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    if (!plan.is_active) {
      console.error("[Payment] ❌ Plan is inactive:", plan_id);
      return res.status(404).json({ success: false, message: "Plan is inactive" });
    }
    
    console.log("[Payment] ✅ Plan found:", plan.name, "Price:", plan.price);

    // Check for existing active subscription
    console.log("[Payment] 🔍 Checking for existing subscription...");
    const existingSubscription = await MembershipSubscription.findOne({
      user_id: userId,
      status: "active",
      expires_at: { $gte: new Date() },
    });

    if (existingSubscription) {
      console.log("[Payment] ⚠️ User already has active subscription");
      return res.status(400).json({
        success: false,
        message: "You already have an active membership",
      });
    }
    
    console.log("[Payment] ✅ No existing subscription found");

    // Calculate total amount (price + GST)
    const planPrice = Number(plan.price);
    const gstPercent = Number(plan.gst_percent) || 18;
    const gstAmount = (planPrice * gstPercent) / 100;
    const totalAmount = planPrice + gstAmount;

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(totalAmount * 100);
    
    console.log("[Payment] 💰 Calculated amounts:");
    console.log("[Payment]    - Plan price:", planPrice);
    console.log("[Payment]    - GST (", gstPercent, "%):", gstAmount);
    console.log("[Payment]    - Total:", totalAmount);
    console.log("[Payment]    - In paise:", amountInPaise);

    // Create Razorpay order
    console.log("[Payment] 💳 Creating Razorpay order...");
    console.log("[Payment] 💳 Razorpay initialized:", !!razorpay);
    
    // Generate receipt (max 40 characters for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = userId.toString().slice(-6); // Last 6 chars of user ID
    const receipt = `mem_${userIdShort}_${timestamp}`; // Format: mem_123456_12345678 (max 25 chars)
    
    console.log("[Payment] 📝 Receipt:", receipt, "Length:", receipt.length);
    
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        user_id: userId.toString(),
        plan_id: plan_id.toString(),
        plan_name: plan.name,
        user_name: user.name,
        user_type: userType,
      },
    });

    console.log("[Payment] ✅ Razorpay order created successfully!");
    console.log("[Payment] ✅ Order ID:", razorpayOrder.id);
    console.log("[Payment] ✅ Order amount:", razorpayOrder.amount);

    res.status(200).json({
      success: true,
      data: {
        order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        plan_name: plan.name,
        plan_price: planPrice,
        gst_amount: gstAmount,
        total_amount: totalAmount,
      },
    });
  } catch (error) {
    console.error("=".repeat(60));
    console.error("[Payment] ❌❌❌ ERROR creating order ❌❌❌");
    console.error("[Payment] Error type:", error.constructor.name);
    console.error("[Payment] Error message:", error.message);
    
    if (error.statusCode) {
      console.error("[Payment] Status code:", error.statusCode);
    }
    
    if (error.error) {
      console.error("[Payment] Razorpay error:", JSON.stringify(error.error, null, 2));
    }
    
    console.error("[Payment] Full error stack:", error.stack);
    console.error("=".repeat(60));
    
    // Send detailed error response
    const errorResponse = {
      success: false,
      message: error.message || "Failed to create payment order",
      error: process.env.NODE_ENV === 'development' ? {
        type: error.constructor.name,
        statusCode: error.statusCode,
        description: error.error?.description
      } : undefined
    };
    
    res.status(500).json(errorResponse);
  }
};

/**
 * Verify payment and create membership subscription
 */
exports.verifyPaymentAndSubscribe = async (req, res) => {
  try {
    const {
      plan_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.user;

    // ✅ CRITICAL: Verify user is authenticated
    if (!userId) {
      console.error("[Payment] ❌ No user ID in token - authentication required");
      return res.status(401).json({ 
        success: false, 
        message: "Please login to verify payment",
        code: "AUTHENTICATION_REQUIRED"
      });
    }

    // Validate required fields
    if (!plan_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // SECURITY: Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("[Payment] SECURITY ALERT: Invalid signature");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log("[Payment] Signature verified successfully");

    // SECURITY: Re-verify user is Farmer
    const user = await User.findById(userId);
    if (!user || user.user_type !== "Farmer") {
      return res.status(403).json({
        success: false,
        message: "Memberships are only for Farmers",
      });
    }

    // Get plan details
    const plan = await MembershipPlan.findById(plan_id);
    if (!plan || !plan.is_active) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    // ✅ CRITICAL: Check for existing active subscription again (prevent duplicates)
    const existingSubscription = await MembershipSubscription.findOne({
      user_id: userId,
      status: "active",
      expires_at: { $gte: new Date() },
    });

    if (existingSubscription) {
      console.log("[Payment] ⚠️ User already has active subscription, returning existing one");
      return res.status(200).json({
        success: true,
        message: "You already have an active membership",
        data: {
          subscription: existingSubscription,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        },
      });
    }

    // ✅ CRITICAL: Check if this payment was already processed (prevent duplicate from same payment)
    const duplicateCheck = await MembershipSubscription.findOne({
      user_id: userId,
      'notes.razorpay_payment_id': razorpay_payment_id
    });

    if (duplicateCheck) {
      console.log("[Payment] ⚠️ Payment already processed, returning existing subscription");
      return res.status(200).json({
        success: true,
        message: "Subscription already created for this payment",
        data: {
          subscription: duplicateCheck,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        },
      });
    }

    // Calculate expiry date
    const expiresAt = new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000);

    // Create subscription with payment tracking
    const subscription = await MembershipSubscription.create({
      user_id: userId,
      plan_id: plan._id,
      purchases_left: plan.validity_purchases,
      expires_at: expiresAt,
      status: "active",
      notes: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        created_at: new Date(),
      }
    });

    console.log(
      "[Payment] Subscription created successfully:",
      subscription._id,
      "for user:",
      user.name
    );

    // Populate plan details for response
    await subscription.populate("plan_id");

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name} plan!`,
      data: {
        subscription,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      },
    });
  } catch (error) {
    console.error("[Payment] Error verifying payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get payment details (for admin/debugging)
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await razorpay.payments.fetch(payment_id);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("[Payment] Error fetching payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
