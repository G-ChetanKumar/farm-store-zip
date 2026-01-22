import apiClient from "../api/axios";

/**
 * Shipping Service for Customer Store
 * Handles pincode validation and delivery serviceability
 */

export const shippingService = {
  /**
   * Check if pincode is serviceable for delivery
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<object>} - { serviceable, data, message }
   */
  checkPincode: async (pincode) => {
    try {
      const response = await apiClient.get(`/shipping/check-pincode/${pincode}`);
      return {
        serviceable: true,
        data: response.data.data,
        message: "Delivery available",
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          serviceable: false,
          data: null,
          message:
            error.response.data.message || "Delivery not available for this pincode",
        };
      }
      throw error;
    }
  },

  /**
   * Get shipping fee for pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<number|null>} - Shipping fee or null if not serviceable
   */
  getShippingFee: async (pincode) => {
    const result = await shippingService.checkPincode(pincode);
    return result.serviceable ? result.data.shipping_fee : null;
  },

  /**
   * Get delivery time estimate for pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<string|null>} - Delivery time or null
   */
  getDeliveryTime: async (pincode) => {
    const result = await shippingService.checkPincode(pincode);
    return result.serviceable ? result.data.delivery_time : null;
  },

  /**
   * Get delivery estimate in days for pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<object|null>} - { min, max } days or null
   */
  getDeliveryEstimate: async (pincode) => {
    const result = await shippingService.checkPincode(pincode);
    return result.serviceable ? result.data.estimated_delivery_days : null;
  },

  /**
   * Check if COD is available for pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<boolean>} - True if COD available
   */
  isCODAvailable: async (pincode) => {
    const result = await shippingService.checkPincode(pincode);
    return result.serviceable ? result.data.is_cod_available : false;
  },

  /**
   * Get all shipping details for pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<object>} - Complete shipping info
   */
  getShippingDetails: async (pincode) => {
    return await shippingService.checkPincode(pincode);
  },

  /**
   * Validate pincode format
   * @param {string} pincode - Pincode to validate
   * @returns {boolean} - True if format is valid
   */
  isValidPincodeFormat: (pincode) => {
    return /^\d{6}$/.test(pincode);
  },

  /**
   * Format delivery estimate for display
   * @param {object} estimate - { min, max } days
   * @returns {string} - Formatted string
   */
  formatDeliveryEstimate: (estimate) => {
    if (!estimate) return "Not available";
    if (estimate.min === estimate.max) {
      return `${estimate.min} ${estimate.min === 1 ? "day" : "days"}`;
    }
    return `${estimate.min}-${estimate.max} days`;
  },

  /**
   * Get list of all Indian states
   * @returns {Promise<Array<string>>}
   */
  getStates: async () => {
    const response = await apiClient.get("/shipping/get-states");
    return response.data;
  },

  /**
   * Get districts by state
   * @param {string} state - State name
   * @returns {Promise<Array<string>>}
   */
  getDistricts: async (state) => {
    const response = await apiClient.get(`/shipping/get-districts/${state}`);
    return response.data;
  },
};
