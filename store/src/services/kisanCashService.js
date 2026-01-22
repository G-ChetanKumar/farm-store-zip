import apiClient from "../api/axios";

/**
 * Kisan Cash (Credits) Service for Customer Store
 * Handles credit/cashback operations
 */

export const kisanCashService = {
  /**
   * Get user's Kisan Cash ledger
   * @param {string} userId - User ID
   * @returns {Promise<object>} - { earned, redeemed, available, transactions }
   */
  getLedger: async (userId) => {
    const response = await apiClient.get(`/v1/credits/ledger/${userId}`);
    return response.data;
  },

  /**
   * Earn Kisan Cash (Admin only)
   * @param {string} userId - User ID
   * @param {string} orderId - Order ID
   * @param {number} amount - Amount to earn
   * @returns {Promise<object>}
   */
  earnCash: async (userId, orderId, amount) => {
    const response = await apiClient.post("/v1/credits/earn", {
      user_id: userId,
      order_id: orderId,
      amount: amount,
    });
    return response.data;
  },

  /**
   * Redeem Kisan Cash (Admin only - but can be used for validation)
   * @param {string} userId - User ID
   * @param {string} orderId - Order ID
   * @param {number} amount - Amount to redeem
   * @param {number} orderTotal - Total order amount
   * @returns {Promise<object>}
   */
  redeemCash: async (userId, orderId, amount, orderTotal) => {
    const response = await apiClient.post("/v1/credits/redeem", {
      user_id: userId,
      order_id: orderId,
      amount: amount,
      order_total: orderTotal,
    });
    return response.data;
  },

  /**
   * Calculate maximum redeemable amount (50% of order total)
   * @param {number} orderTotal - Order total
   * @param {number} availableCredit - User's available credit
   * @returns {number} - Maximum redeemable amount
   */
  calculateMaxRedeemable: (orderTotal, availableCredit) => {
    const maxAllowed = Math.floor(orderTotal * 0.5); // 50% cap
    return Math.min(maxAllowed, availableCredit);
  },

  /**
   * Validate redemption amount
   * @param {number} amount - Amount to redeem
   * @param {number} orderTotal - Order total
   * @param {number} availableCredit - Available credit
   * @returns {object} - { valid, error }
   */
  validateRedemption: (amount, orderTotal, availableCredit) => {
    if (amount <= 0) {
      return { valid: false, error: "Amount must be greater than 0" };
    }
    
    const maxAllowed = Math.floor(orderTotal * 0.5);
    if (amount > maxAllowed) {
      return { valid: false, error: `Maximum ₹${maxAllowed} can be redeemed (50% of order)` };
    }
    
    if (amount > availableCredit) {
      return { valid: false, error: "Insufficient credits" };
    }
    
    return { valid: true, error: null };
  },

  /**
   * Format credit for display
   * @param {number} amount - Credit amount
   * @returns {string} - Formatted string
   */
  formatCredit: (amount) => {
    return `₹${amount.toFixed(2)}`;
  },
};
