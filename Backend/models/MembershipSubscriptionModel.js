const mongoose = require("mongoose");

const membershipSubscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    purchases_left: { type: Number, required: true },
    expires_at: { type: Date, required: true },
    last_used_at: { type: Date }, // Track last usage
    cancelled_at: { type: Date }, // Track cancellation date
    cancelled_reason: { type: String }, // Why subscription was cancelled
    notes: { type: mongoose.Schema.Types.Mixed }, // Payment details and tracking info
  },
  { timestamps: true }
);

// Indexes for performance
membershipSubscriptionSchema.index({ user_id: 1 }, { name: "idx_membership_user_id" });
membershipSubscriptionSchema.index({ plan_id: 1 }, { name: "idx_membership_plan_id" });
membershipSubscriptionSchema.index({ status: 1, expires_at: 1 }, { name: "idx_membership_status_expiry" });

// Index for payment tracking (prevent duplicate payments)
membershipSubscriptionSchema.index({ "notes.razorpay_payment_id": 1 }, { 
  name: "idx_payment_tracking",
  sparse: true // Only index documents that have this field
});

module.exports = mongoose.model("MembershipSubscription", membershipSubscriptionSchema);
