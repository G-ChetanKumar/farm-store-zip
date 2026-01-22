import apiClient from "../api/axios";

/**
 * Coupon Service for Customer Store
 * Handles coupon-related operations for end users
 */

export const couponService = {
  /**
   * Get available coupons for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of active, non-expired coupons
   */
  getUserCoupons: async (userId) => {
    const response = await apiClient.get(`/v1/coupons/${userId}`);
    return response.data;
  },

  /**
   * Apply coupon code to order
   * @param {string} code - Coupon code
   * @param {string} userId - User ID
   * @param {number} orderTotal - Order total before discount
   * @returns {Promise<object>} - { discount, new_total }
   */
  applyCoupon: async (code, userId, orderTotal) => {
    // Validate inputs before sending
    if (!code || !code.trim()) {
      throw new Error("Coupon code is required");
    }
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    if (!orderTotal || orderTotal <= 0) {
      throw new Error("Valid order total is required");
    }
    
    const payload = {
      code: code.toUpperCase().trim(),
      user_id: userId,
      order_total: parseFloat(orderTotal),
    };
    
    console.log("🎟️ Applying coupon:", payload);
    
    const response = await apiClient.post("/v1/coupons/apply", payload);
    
    console.log("✅ Coupon applied:", response.data);
    
    return response.data;
  },

  /**
   * Validate coupon without applying
   * @param {string} code - Coupon code
   * @param {string} userId - User ID
   * @param {number} orderTotal - Order total
   * @returns {Promise<boolean>} - True if valid
   */
  validateCoupon: async (code, userId, orderTotal) => {
    try {
      const result = await couponService.applyCoupon(code, userId, orderTotal);
      return result.success === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all public coupons (global coupons)
   * Uses a dummy userId to fetch global coupons
   * @returns {Promise<Array>}
   */
  getPublicCoupons: async () => {
    try {
      // Using a non-existent userId will return only global coupons
      const response = await apiClient.get("/v1/coupons/000000000000000000000000");
      return response.data;
    } catch (error) {
      console.error("Error fetching public coupons:", error);
      return { success: false, data: [] };
    }
  },

  /**
   * Calculate discount for display
   * @param {number} orderTotal - Order total
   * @param {number} discountValue - Discount value
   * @param {string} discountType - "percent" or "flat"
   * @returns {object} - { discount, newTotal, savings }
   */
  calculateDiscount: (orderTotal, discountValue, discountType) => {
    let discount = 0;
    if (discountType === "percent") {
      discount = Math.floor((orderTotal * discountValue) / 100);
    } else {
      discount = discountValue;
    }
    const newTotal = Math.max(orderTotal - discount, 0);
    const savings = discount;
    
    return { discount, newTotal, savings };
  },

  /**
   * Format coupon for display
   * @param {object} coupon - Coupon object
   * @returns {object} - Formatted coupon
   */
  formatCoupon: (coupon) => {
    return {
      id: coupon._id,
      code: coupon.code,
      description: `${coupon.discount_type === "percent" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}`,
      minOrder: coupon.min_order,
      expiresAt: new Date(coupon.expires_at),
      isExpired: new Date(coupon.expires_at) < new Date(),
      usageLimit: coupon.usage_limit,
      usedCount: coupon.used_count,
      isActive: coupon.is_active,
      discountValue: coupon.value,
      discountType: coupon.discount_type,
    };
  },
};
