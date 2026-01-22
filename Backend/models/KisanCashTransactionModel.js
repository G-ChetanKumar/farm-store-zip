const mongoose = require("mongoose");

const kisanCashTransactionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: { type: String, enum: ["earn", "redeem"], required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

kisanCashTransactionSchema.index({ user_id: 1 }, { name: "idx_kisan_cash_user_id" });

module.exports = mongoose.model("KisanCashTransaction", kisanCashTransactionSchema);
