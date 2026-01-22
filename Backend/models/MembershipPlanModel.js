const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cashback_percent: { type: Number, required: true },
    gst_percent: { type: Number, default: 18 },
    validity_purchases: { type: Number, required: true },
    validity_days: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
    can_club_coupons: { type: Boolean, default: false }, // NEW: Allow coupon clubbing with membership
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
