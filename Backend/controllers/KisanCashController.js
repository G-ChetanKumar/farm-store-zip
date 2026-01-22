const KisanCashTransaction = require("../models/KisanCashTransactionModel");
const MembershipSubscription = require("../models/MembershipSubscriptionModel");

const getLedgerSummary = async (userId) => {
  const transactions = await KisanCashTransaction.find({ user_id: userId }).sort({ createdAt: -1 });
  const earned = transactions.filter((t) => t.type === "earn").reduce((sum, t) => sum + t.amount, 0);
  const redeemed = transactions.filter((t) => t.type === "redeem").reduce((sum, t) => sum + t.amount, 0);
  const available = earned - redeemed;
  return { earned, redeemed, available, transactions };
};

exports.getLedger = async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await getLedgerSummary(userId);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.earn = async (req, res) => {
  try {
    const { user_id, order_id, amount } = req.body;
    if (!user_id || !amount) {
      return res.status(400).json({ success: false, message: "user_id and amount are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    await KisanCashTransaction.create({ user_id, order_id, type: "earn", amount });
    const summary = await getLedgerSummary(user_id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.redeem = async (req, res) => {
  try {
    const { user_id, order_id, amount, order_total } = req.body;
    if (!user_id || !amount || !order_total) {
      return res.status(400).json({ success: false, message: "user_id, amount, order_total are required" });
    }
    if (Number(amount) <= 0 || Number(order_total) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount or order_total" });
    }
    const membership = await MembershipSubscription.findOne({
      user_id,
      status: "active",
      expires_at: { $gte: new Date() },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: "Membership required to redeem credits" });
    }
    const summary = await getLedgerSummary(user_id);
    const maxAllowed = Math.floor(order_total * 0.5);
    if (amount > maxAllowed) {
      return res.status(400).json({ success: false, message: "Redeem amount exceeds 50% cap" });
    }
    if (amount > summary.available) {
      return res.status(400).json({ success: false, message: "Insufficient credits" });
    }
    await KisanCashTransaction.create({ user_id, order_id, type: "redeem", amount });
    const updated = await getLedgerSummary(user_id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
