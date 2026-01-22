import apiClient from "../api/axios";

/**
 * Coupon Service
 * Handles all coupon-related API calls for admin panel
 */

export const couponService = {
  /**
   * Get all coupons (Admin only)
   * @returns {Promise<Array>}
   */
  getAllCoupons: async () => {
    const response = await apiClient.get("/api/v1/coupons/admin/all");
    return response.data;
  },

  /**
   * Get coupon statistics (Admin only)
   * @returns {Promise<object>}
   */
  getCouponStats: async () => {
    const response = await apiClient.get("/api/v1/coupons/admin/stats");
    return response.data;
  },

  /**
   * Create new coupon (Admin only)
   * @param {object} couponData - Coupon data
   * @returns {Promise<object>}
   */
  createCoupon: async (couponData) => {
    const response = await apiClient.post("/api/v1/coupons", couponData);
    return response.data;
  },

  /**
   * Update coupon (Admin only)
   * @param {string} id - Coupon ID
   * @param {object} couponData - Updated coupon data
   * @returns {Promise<object>}
   */
  updateCoupon: async (id, couponData) => {
    const response = await apiClient.put(`/api/v1/coupons/${id}`, couponData);
    return response.data;
  },

  /**
   * Delete coupon (Admin only)
   * @param {string} id - Coupon ID
   * @returns {Promise<object>}
   */
  deleteCoupon: async (id) => {
    const response = await apiClient.delete(`/api/v1/coupons/${id}`);
    return response.data;
  },

  /**
   * Toggle coupon active status (Admin only)
   * @param {string} id - Coupon ID
   * @returns {Promise<object>}
   */
  toggleCouponStatus: async (id) => {
    const response = await apiClient.patch(`/api/v1/coupons/${id}/toggle`);
    return response.data;
  },

  /**
   * Get coupons for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  getUserCoupons: async (userId) => {
    const response = await apiClient.get(`/api/v1/coupons/user/${userId}`);
    return response.data;
  },

  /**
   * Apply coupon to order
   * @param {string} code - Coupon code
   * @param {string} userId - User ID
   * @param {number} orderTotal - Order total amount
   * @returns {Promise<object>} - Discount and new total
   */
  applyCoupon: async (code, userId, orderTotal) => {
    const response = await apiClient.post("/api/v1/coupons/apply", {
      code,
      user_id: userId,
      order_total: orderTotal,
    });
    return response.data;
  },

  /**
   * Helper: Map frontend form to backend schema
   * @param {object} formData - Frontend form data
   * @returns {object} - Backend compatible data
   */
  mapFormToBackend: (formData) => {
    return {
      code: formData.coupon_code,
      discount_type: formData.discount_type === "percentage" ? "percent" : "flat",
      value: parseFloat(formData.discount_value),
      min_order: parseFloat(formData.min_order_amount) || 0,
      expires_at: new Date(formData.valid_until),
      usage_limit: parseInt(formData.total_usage_limit) || 1,
      is_active: formData.is_active,
      user_id: formData.user_id || undefined,
    };
  },

  /**
   * Helper: Map backend data to frontend form
   * @param {object} coupon - Backend coupon data
   * @returns {object} - Frontend form compatible data
   */
  mapBackendToForm: (coupon) => {
    return {
      _id: coupon._id,
      coupon_code: coupon.code || "",
      coupon_name: "",
      discount_type: coupon.discount_type === "percent" ? "percentage" : "flat",
      discount_value: coupon.value || "",
      min_order_amount: coupon.min_order || "",
      max_discount_amount: "",
      valid_from: "",
      valid_until: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().split("T")[0]
        : "",
      total_usage_limit: coupon.usage_limit || "",
      per_user_limit: 1,
      applicable_stores: "all",
      applicable_user_types: ["all"],
      is_active: coupon.is_active,
      description: "",
      user_id: coupon.user_id?._id || "",
    };
  },
};
