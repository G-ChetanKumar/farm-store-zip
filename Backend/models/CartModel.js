const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    qty: { type: Number, required: true },
    unit_price: { type: Number },
    original_price: { type: Number },
    commission: { type: Number },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.index({ user_id: 1 }, { name: "idx_cart_user_id" });

module.exports = mongoose.model("Cart", cartSchema);
