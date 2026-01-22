const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const { sanitizeString } = require("../lib/validation");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const hashSnapshot = (snapshot) => {
  return crypto.createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
};

const calculateTotals = async (items) => {
  const snapshot = [];
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.product_id);
    if (!product) continue;
    const variant = item.variant_index !== undefined
      ? product.package_qty?.[item.variant_index]
      : product.package_qty?.[0];
    const unitPrice = Number(variant?.sell_price || 0);
    const originalPrice = Number(variant?.mrp_price || 0);
    const qty = Number(item.qty || 1);
    total += unitPrice * qty;
    snapshot.push({
      product_id: product._id,
      variant_id: variant?._id,
      variant_qty: qty,
      unit_price: unitPrice,
      original_price: originalPrice,
    });
  }
  return { total, snapshot };
};

// Simple payment order creation for direct amount-based payments
exports.createSimpleOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGatewayOrder = async (req, res) => {
  try {
    const { items, payment_method, address_id } = req.body;
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return res.status(400).json({ success: false, message: "Idempotency-Key required" });
    }
    const method = sanitizeString(payment_method);
    if (method && !["upi", "qr", "cod", "razorpay"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment_method" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items are required" });
    }
    const existing = await Order.findOne({ idempotency_key: idempotencyKey });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }
    const { total, snapshot } = await calculateTotals(items || []);
    const snapshotHash = hashSnapshot(snapshot);
    let codPartialAmount = null;
    if (method === "cod") {
      codPartialAmount = Math.round(total * 0.1);
    }
    const order = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `fes_${Date.now()}`,
    });
    const created = await Order.create({
      name: req.body.name || "",
      user_id: req.user,
      date: new Date().toISOString(),
      razorpay_payment_status: "created",
      transaction_id: order.id,
      payment_method,
      address_id,
      price_snapshot: snapshot,
      price_snapshot_hash: snapshotHash,
      idempotency_key: idempotencyKey,
      gateway_order_id: order.id,
      payment_status: "created",
      total_amount: total,
      cod_partial_amount: codPartialAmount,
      status: "created",
    });
    res.status(201).json({ success: true, data: { order, db_order: created } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (signature !== expected) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    const event = req.body;
    const payment = event.payload?.payment?.entity;
    if (payment) {
      await Order.findOneAndUpdate(
        { gateway_order_id: payment.order_id },
        {
          gateway_payment_id: payment.id,
          payment_status: payment.status,
          paid_at: new Date(payment.created_at * 1000),
        }
      );
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Order.find()
      .populate("user_id", "name email mobile user_type")
      .sort({ createdAt: -1 })
      .lean();

    // Transform orders to payment format expected by frontend
    const formattedPayments = payments.map((order) => ({
      _id: order._id,
      transaction_id: order.transaction_id || order.gateway_order_id,
      razorpay_payment_id: order.gateway_payment_id,
      razorpay_order_id: order.gateway_order_id,
      order_id: {
        _id: order._id,
        name: order.name,
        total_amount: order.total_amount,
      },
      user_id: order.user_id,
      amount: order.total_amount,
      payment_method: order.payment_method,
      status: order.payment_status || order.razorpay_payment_status,
      payment_date: order.paid_at || order.createdAt,
      createdAt: order.createdAt,
      cod_partial_amount: order.cod_partial_amount,
    }));

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Order.countDocuments();
    
    const successPayments = await Order.countDocuments({
      payment_status: { $in: ["captured", "success", "paid"] },
    });
    
    const failedPayments = await Order.countDocuments({
      payment_status: { $in: ["failed", "error"] },
    });
    
    const pendingPayments = await Order.countDocuments({
      payment_status: { $in: ["created", "pending", "authorized"] },
    });

    const totalAmountResult = await Order.aggregate([
      {
        $match: {
          payment_status: { $in: ["captured", "success", "paid"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total_amount" },
        },
      },
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Payment method breakdown
    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          amount: { $sum: "$total_amount" },
        },
      },
    ]);

    res.status(200).json({
      totalPayments,
      successPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      totalRevenue: totalAmount, // Alias for compatibility
      successRate: totalPayments > 0 ? ((successPayments / totalPayments) * 100).toFixed(2) : 0,
      paymentMethodStats,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_amount, refund_reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!order.gateway_payment_id) {
      return res.status(400).json({ success: false, message: "No payment ID found for refund" });
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(order.gateway_payment_id, {
      amount: Math.round(refund_amount * 100),
      notes: {
        reason: refund_reason,
      },
    });

    // Update order with refund information
    await Order.findByIdAndUpdate(id, {
      refund_status: refund.status,
      refund_id: refund.id,
      refund_amount: refund_amount,
      refund_reason: refund_reason,
      refunded_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refund,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer: Request return/refund
exports.requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { return_reason, return_reason_details, return_images } = req.body;

    console.log("🔄 [requestReturn] ===== START =====");
    console.log("🔄 [requestReturn] Order ID:", orderId);
    console.log("🔄 [requestReturn] User ID from middleware:", req.user);
    console.log("🔄 [requestReturn] Request body:", req.body);
    console.log("🔄 [requestReturn] Headers:", {
      authorization: req.header("Authorization") ? "Present" : "Missing",
      csrf: req.header("X-CSRF-Token") ? "Present" : "Missing"
    });

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify order belongs to user (skip if no auth - test mode)
    if (req.user) {
      if (String(order.user_id) !== String(req.user)) {
        console.log("❌ [requestReturn] User mismatch:");
        console.log("   Order user_id:", order.user_id);
        console.log("   Request user:", req.user);
        return res.status(403).json({ success: false, message: "Unauthorized access to this order" });
      }
      console.log("✅ [requestReturn] User authorized for this order");
    } else {
      console.log("⚠️ [requestReturn] No user auth - TEST MODE");
    }

    // Check if order is delivered
    if (order.order_status !== "delivered") {
      return res.status(400).json({ 
        success: false, 
        message: "Returns can only be requested for delivered orders" 
      });
    }

    // Check if return already requested
    if (order.return_requested) {
      return res.status(400).json({ 
        success: false, 
        message: "Return request already exists for this order" 
      });
    }

    // Check return window (7 days from delivery)
    if (order.delivered_at) {
      const daysSinceDelivery = Math.floor(
        (new Date() - new Date(order.delivered_at)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceDelivery > 7) {
        return res.status(400).json({ 
          success: false, 
          message: "Return window (7 days) has expired" 
        });
      }
    }

    // Update order with return request
    order.return_requested = true;
    order.return_request_date = new Date();
    order.return_reason = return_reason;
    order.return_reason_details = return_reason_details;
    order.return_status = "pending";
    order.return_images = return_images || [];
    
    await order.save();

    console.log("✅ [requestReturn] Return request created successfully");

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ [requestReturn] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer: Get my return requests
exports.getMyReturnRequests = async (req, res) => {
  try {
    const returns = await Order.find({
      user_id: req.user,
      return_requested: true,
    })
      .populate("user_id", "name email mobile user_type")
      .sort({ return_request_date: -1 })
      .lean();

    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    console.error("Error fetching return requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all return requests
exports.getAllReturnRequests = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;
    
    let query = { return_requested: true };
    
    if (status && status !== "all") {
      query.return_status = status;
    }
    
    if (from_date) {
      query.return_request_date = { $gte: new Date(from_date) };
    }
    
    if (to_date) {
      query.return_request_date = { 
        ...query.return_request_date, 
        $lte: new Date(to_date) 
      };
    }

    const returns = await Order.find(query)
      .populate("user_id", "name email mobile user_type")
      .populate("return_approved_by", "name email")
      .sort({ return_request_date: -1 })
      .lean();

    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    console.error("Error fetching return requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get return statistics
exports.getReturnStats = async (req, res) => {
  try {
    const totalReturns = await Order.countDocuments({ return_requested: true });
    
    const pendingReturns = await Order.countDocuments({ 
      return_requested: true,
      return_status: "pending" 
    });
    
    const approvedReturns = await Order.countDocuments({ 
      return_requested: true,
      return_status: "approved" 
    });
    
    const rejectedReturns = await Order.countDocuments({ 
      return_requested: true,
      return_status: "rejected" 
    });
    
    const completedReturns = await Order.countDocuments({ 
      return_requested: true,
      return_status: "completed" 
    });

    // Calculate total refunded amount
    const refundedAmountResult = await Order.aggregate([
      {
        $match: {
          return_requested: true,
          refund_amount: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$refund_amount" },
        },
      },
    ]);

    const totalRefunded = refundedAmountResult.length > 0 ? refundedAmountResult[0].total : 0;

    // Return reasons breakdown
    const returnReasons = await Order.aggregate([
      {
        $match: { return_requested: true },
      },
      {
        $group: {
          _id: "$return_reason",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReturns,
        pendingReturns,
        approvedReturns,
        rejectedReturns,
        completedReturns,
        totalRefunded,
        approvalRate: totalReturns > 0 ? ((approvedReturns / totalReturns) * 100).toFixed(2) : 0,
        returnReasons,
      },
    });
  } catch (error) {
    console.error("Error fetching return stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve return request
exports.approveReturn = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { return_notes } = req.body;

    const order = await Order.findById(requestId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (!order.return_requested) {
      return res.status(400).json({ success: false, message: "No return request found for this order" });
    }

    if (order.return_status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Return request is already ${order.return_status}` 
      });
    }

    order.return_status = "approved";
    order.return_approved_by = req.user; // Admin user ID from middleware
    order.return_approved_at = new Date();
    order.return_notes = return_notes || "";
    
    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request approved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Reject return request
exports.rejectReturn = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { return_rejected_reason } = req.body;

    if (!return_rejected_reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Rejection reason is required" 
      });
    }

    const order = await Order.findById(requestId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (!order.return_requested) {
      return res.status(400).json({ success: false, message: "No return request found for this order" });
    }

    if (order.return_status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Return request is already ${order.return_status}` 
      });
    }

    order.return_status = "rejected";
    order.return_rejected_reason = return_rejected_reason;
    order.return_approved_by = req.user; // Track who rejected
    order.return_approved_at = new Date();
    
    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request rejected",
      data: order,
    });
  } catch (error) {
    console.error("Error rejecting return:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Process refund for approved return
exports.processReturnRefund = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { refund_amount, notes } = req.body;

    const order = await Order.findById(requestId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (order.return_status !== "approved") {
      return res.status(400).json({ 
        success: false, 
        message: "Return must be approved before processing refund" 
      });
    }

    const amountToRefund = refund_amount || order.total_amount;

    // Process refund for online payments
    if (order.gateway_payment_id && order.payment_method !== "cod") {
      try {
        const refund = await razorpay.payments.refund(order.gateway_payment_id, {
          amount: Math.round(amountToRefund * 100),
          notes: {
            reason: order.return_reason,
            return_request_id: order._id.toString(),
          },
        });

        order.refund_status = refund.status;
        order.refund_id = refund.id;
      } catch (refundError) {
        console.error("Razorpay refund error:", refundError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to process refund with payment gateway",
          error: refundError.message,
        });
      }
    } else {
      // For COD, mark as processed manually
      order.refund_status = "processed";
    }

    order.refund_amount = amountToRefund;
    order.refund_reason = order.return_reason;
    order.refunded_at = new Date();
    order.return_status = "completed";
    order.return_completed_at = new Date();
    
    if (notes) {
      order.return_notes = (order.return_notes || "") + "\n" + notes;
    }
    
    await order.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error processing return refund:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
