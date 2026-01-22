const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    discount_type: { type: String, enum: ["flat", "percent"], required: true },
    value: { type: Number, required: true },
    min_order: { type: Number, default: 0 },
    expires_at: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    usage_limit: { type: Number, default: 1 },
    used_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { name: "idx_coupon_code" });
couponSchema.index({ user_id: 1 }, { name: "idx_coupon_user_id" });

module.exports = mongoose.model("Coupon", couponSchema);
