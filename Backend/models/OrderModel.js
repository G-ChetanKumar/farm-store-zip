const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  razorpay_payment_status: {
    type: String,
    required: false, // Not required for COD orders
  },
  transaction_id: {
    type: String,
    required: false, // Not required for COD orders
  },
  role: { type: String },
  delivery_mode: { type: String }, // "home" or "pickup"
  payment_method: { type: String }, // "online" or "cod"
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  counter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Counter" }, // For pickup orders
  counter_name: { type: String }, // Store name for pickup
  coupon_code: { type: String }, // Applied coupon code
  coupon_discount: { type: Number, default: 0 }, // Coupon discount amount
  kisan_cash_redeemed: { type: Number, default: 0 }, // Kisan Cash credits used
  price_snapshot: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variant_id: { type: mongoose.Schema.Types.ObjectId },
      variant_qty: { type: Number },
      unit_price: { type: Number },
      original_price: { type: Number },
      commission: { type: Number },
    },
  ],
  commission_snapshot: { type: Number },
  cod_partial_amount: { type: Number },
  gateway_order_id: { type: String },
  gateway_payment_id: { type: String },
  gateway_signature: { type: String },
  payment_status: { type: String },
  paid_at: { type: Date },
  price_snapshot_hash: { type: String },
  idempotency_key: { type: String },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  order_status: {
    type: String,
    enum: ["pending", "shipment", "delivered"],
    default: "pending",
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
  },
  
  // Membership discount fields
  membership_discount: {
    type: Number,
    default: 0,
  },
  membership_applied: {
    subscription_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "MembershipSubscription" 
    },
    plan_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "MembershipPlan" 
    },
    plan_name: { type: String },
    discount_percent: { type: Number },
    discount_amount: { type: Number },
    user_type_verified: { type: String }, // Must be "Farmer"
    purchases_left_before: { type: Number },
    purchases_left_after: { type: Number },
    applied_at: { type: Date },
    subscription_status_at_time: { type: String }
  },
  kisan_cash_earned: {
    type: Number,
    default: 0,
  },
  
  // Refund fields
  refund_status: {
    type: String,
    enum: ["pending", "processing", "processed", "failed"],
  },
  refund_id: {
    type: String,
  },
  refund_amount: {
    type: Number,
  },
  refund_reason: {
    type: String,
  },
  refunded_at: {
    type: Date,
  },
  
  // Return/Refund Request fields (Customer-initiated)
  return_requested: {
    type: Boolean,
    default: false,
  },
  return_request_date: {
    type: Date,
  },
  return_reason: {
    type: String,
  },
  return_reason_details: {
    type: String,
  },
  return_status: {
    type: String,
    enum: ["pending", "approved", "rejected", "processing", "completed", "cancelled"],
  },
  return_notes: {
    type: String, // Admin notes
  },
  return_images: [{
    type: String, // URLs to uploaded images
  }],
  return_approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  return_approved_at: {
    type: Date,
  },
  return_rejected_reason: {
    type: String,
  },
  return_completed_at: {
    type: Date,
  },
  
  // Shipping/Delivery tracking fields
  tracking_number: {
    type: String,
  },
  delivery_partner: {
    type: String,
  },
  estimated_delivery: {
    type: Date,
  },
  delivery_notes: {
    type: String,
  },
  delivered_at: {
    type: Date,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model("Order", orderSchema);
