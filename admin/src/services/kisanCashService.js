import apiClient from "../api/axios";

/**
 * Kisan Cash Service for Admin Panel
 * Handles Kisan Cash (credits) management
 */

export const kisanCashService = {
  /**
   * Get Kisan Cash ledger for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  getUserLedger: async (userId) => {
    const response = await apiClient.get(`/api/v1/credits/ledger/${userId}`);
    return response.data;
  },

  /**
   * Credit Kisan Cash to user (Admin only)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to credit
   * @param {string} orderId - Optional order ID
   * @returns {Promise<object>}
   */
  earnKisanCash: async (userId, amount, orderId = null) => {
    const response = await apiClient.post("/api/v1/credits/earn", {
      user_id: userId,
      amount,
      order_id: orderId,
    });
    return response.data;
  },

  /**
   * Debit Kisan Cash from user (Admin only)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to debit
   * @param {number} orderTotal - Order total
   * @param {string} orderId - Optional order ID
   * @returns {Promise<object>}
   */
  redeemKisanCash: async (userId, amount, orderTotal, orderId = null) => {
    const response = await apiClient.post("/api/v1/credits/redeem", {
      user_id: userId,
      amount,
      order_total: orderTotal,
      order_id: orderId,
    });
    return response.data;
  },

  /**
   * Get balance for user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  getBalance: async (userId) => {
    try {
      const result = await kisanCashService.getUserLedger(userId);
      if (result.success && result.data) {
        return result.data.balance || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return 0;
    }
  },

  /**
   * Format transaction history for table
   * @param {Array} transactions - Raw transactions
   * @returns {Array} - Formatted transactions
   */
  formatTransactions: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.map((txn) => ({
      id: txn._id,
      date: new Date(txn.createdAt).toLocaleString("en-IN"),
      type: txn.type,
      amount: txn.amount,
      formattedAmount: `₹${txn.amount}`,
      orderId: txn.order_id || "N/A",
      color: txn.type === "earn" ? "success" : "error",
    }));
  },

  /**
   * Calculate statistics
   * @param {Array} transactions - Transactions array
   * @returns {object} - { totalEarned, totalRedeemed, transactionCount }
   */
  calculateStats: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return { totalEarned: 0, totalRedeemed: 0, transactionCount: 0 };
    }

    const totalEarned = transactions
      .filter((t) => t.type === "earn")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRedeemed = transactions
      .filter((t) => t.type === "redeem")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalEarned,
      totalRedeemed,
      transactionCount: transactions.length,
    };
  },
};
