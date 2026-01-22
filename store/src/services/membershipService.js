import apiClient from "../api/axios";

/**
 * Membership Service for Customer Store
 * Handles membership plans and subscriptions
 */

export const membershipService = {
  /**
   * Get all membership plans
   * @returns {Promise<Array>}
   */
  getMembershipPlans: async () => {
    const response = await apiClient.get("/v1/membership/plans");
    return response.data;
  },

  /**
   * Subscribe to a membership plan (LEGACY - use createPaymentOrder + verifyPayment instead)
   * @param {string} planId - Plan ID
   * @returns {Promise<object>}
   */
  subscribe: async (planId) => {
    const response = await apiClient.post("/v1/membership/subscribe", {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Create Razorpay payment order for membership
   * @param {string} planId - Plan ID
   * @returns {Promise<object>} - { order_id, amount, currency, plan_name, etc. }
   */
  createPaymentOrder: async (planId) => {
    console.log('[MembershipService] Creating payment order for plan:', planId);
    const response = await apiClient.post("/v1/membership/create-payment-order", {
      plan_id: planId,
    });
    console.log('[MembershipService] Payment order created:', response.data);
    return response.data;
  },

  /**
   * Verify Razorpay payment and create subscription
   * @param {object} paymentData - { plan_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * @returns {Promise<object>}
   */
  verifyPayment: async (paymentData) => {
    console.log('[MembershipService] Verifying payment:', paymentData);
    const response = await apiClient.post("/v1/membership/verify-payment", paymentData);
    console.log('[MembershipService] Payment verified:', response.data);
    return response.data;
  },

  /**
   * Get user's membership subscription
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  getSubscription: async (userId) => {
    const response = await apiClient.get(`/v1/membership/subscription/${userId}`);
    return response.data;
  },

  /**
   * Check if user has active membership
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  hasActiveMembership: async (userId) => {
    try {
      const result = await membershipService.getSubscription(userId);
      if (result.success && result.data) {
        const subscription = result.data;
        const now = new Date();
        return (
          subscription.is_active &&
          new Date(subscription.expires_at) > now &&
          subscription.purchases_remaining > 0
        );
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Calculate membership benefits
   * @param {object} plan - Membership plan
   * @param {number} orderTotal - Order total
   * @returns {object} - { cashback, effectiveCost, breakeven }
   */
  calculateBenefits: (plan, orderTotal) => {
    const cashback = Math.floor((orderTotal * plan.cashback_percent) / 100);
    const effectiveCost = plan.price - cashback;
    const breakeven = Math.ceil(plan.price / (plan.cashback_percent / 100));

    return { cashback, effectiveCost, breakeven };
  },

  /**
   * Format subscription status
   * @param {object} subscription - Subscription object
   * @returns {object} - Formatted status
   */
  formatSubscription: (subscription) => {
    if (!subscription) {
      return {
        isActive: false,
        status: "No active membership",
        color: "gray",
      };
    }

    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const isExpired = expiresAt < now;
    const noPurchasesLeft = subscription.purchases_remaining <= 0;

    if (!subscription.is_active || isExpired || noPurchasesLeft) {
      return {
        isActive: false,
        status: "Expired",
        color: "red",
        expiresAt: subscription.expires_at,
      };
    }

    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    return {
      isActive: true,
      status: "Active",
      color: "green",
      daysRemaining,
      purchasesRemaining: subscription.purchases_remaining,
      expiresAt: subscription.expires_at,
    };
  },

  /**
   * Get membership tier name
   * @param {string} planName - Plan name
   * @returns {string} - Tier name (Bronze, Silver, Gold, Platinum)
   */
  getTierName: (planName) => {
    const name = planName.toLowerCase();
    if (name.includes("platinum")) return "Platinum";
    if (name.includes("gold")) return "Gold";
    if (name.includes("silver")) return "Silver";
    if (name.includes("bronze")) return "Bronze";
    return "Standard";
  },

  /**
   * Get tier color
   * @param {string} tierName - Tier name
   * @returns {string} - Color hex code
   */
  getTierColor: (tierName) => {
    switch (tierName.toLowerCase()) {
      case "platinum":
        return "#E5E4E2";
      case "gold":
        return "#FFD700";
      case "silver":
        return "#C0C0C0";
      case "bronze":
        return "#CD7F32";
      default:
        return "#4A5568";
    }
  },
};
