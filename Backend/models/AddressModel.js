const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: { type: String, required: true }, // e.g., Home, Office
    tag: { type: String }, // optional tag
    name: { type: String },
    phone: { type: String },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, default: "India" },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ user_id: 1 }, { name: "idx_address_user_id" });

module.exports = mongoose.model("Address", addressSchema);
