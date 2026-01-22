import apiClient from "../api/axios";

/**
 * Membership Service for Admin Panel
 * Handles membership plan management
 */

export const membershipService = {
  /**
   * Get all membership plans
   * @returns {Promise<Array>}
   */
  getAllPlans: async () => {
    const response = await apiClient.get("/api/v1/membership/plans");
    return response.data;
  },

  /**
   * Create new membership plan (Admin only)
   * @param {object} planData - Plan data
   * @returns {Promise<object>}
   */
  createPlan: async (planData) => {
    const response = await apiClient.post("/api/v1/membership/plans", planData);
    return response.data;
  },

  /**
   * Get user subscription details
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  getUserSubscription: async (userId) => {
    const response = await apiClient.get(`/api/v1/membership/subscription/${userId}`);
    return response.data;
  },

  /**
   * Validate plan data
   * @param {object} plan - Plan object
   * @returns {object} - { valid, errors }
   */
  validatePlan: (plan) => {
    const errors = [];

    if (!plan.name || plan.name.trim().length === 0) {
      errors.push("Plan name is required");
    }
    if (!plan.price || plan.price <= 0) {
      errors.push("Price must be greater than 0");
    }
    if (!plan.cashback_percent || plan.cashback_percent < 0 || plan.cashback_percent > 100) {
      errors.push("Cashback percent must be between 0 and 100");
    }
    if (!plan.validity_purchases || plan.validity_purchases <= 0) {
      errors.push("Validity purchases must be greater than 0");
    }
    if (!plan.validity_days || plan.validity_days <= 0) {
      errors.push("Validity days must be greater than 0");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Calculate plan ROI
   * @param {object} plan - Plan object
   * @param {number} avgOrderValue - Average order value
   * @returns {object} - { breakeven, estimatedSavings }
   */
  calculateROI: (plan, avgOrderValue) => {
    const cashbackPerOrder = Math.floor((avgOrderValue * plan.cashback_percent) / 100);
    const breakeven = Math.ceil(plan.price / cashbackPerOrder);
    const estimatedSavings = cashbackPerOrder * plan.validity_purchases - plan.price;

    return { breakeven, estimatedSavings, cashbackPerOrder };
  },
};
