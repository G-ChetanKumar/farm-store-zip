import apiClient from "../api/axios";
import { shippingService } from "./shippingService";

/**
 * Address Service for Customer Store
 * Handles user address management
 */

export const addressService = {
  /**
   * Get all addresses for current user
   * @returns {Promise<Array>}
   */
  getAddresses: async () => {
    const response = await apiClient.get("/v1/addresses");
    return response.data;
  },

  /**
   * Add new address
   * @param {object} addressData - Address data
   * @returns {Promise<object>}
   */
  addAddress: async (addressData) => {
    const response = await apiClient.post("/v1/addresses", addressData);
    return response.data;
  },

  /**
   * Update address
   * @param {string} addressId - Address ID
   * @param {object} addressData - Updated address data
   * @returns {Promise<object>}
   */
  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(`/v1/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   * @param {string} addressId - Address ID
   * @returns {Promise<object>}
   */
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/v1/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set default address
   * @param {string} addressId - Address ID
   * @returns {Promise<object>}
   */
  setDefaultAddress: async (addressId) => {
    const response = await apiClient.patch(`/v1/addresses/${addressId}/default`);
    return response.data;
  },

  /**
   * Get default address
   * @returns {Promise<object|null>}
   */
  getDefaultAddress: async () => {
    const result = await addressService.getAddresses();
    if (result.success && result.data) {
      return result.data.find((addr) => addr.is_default) || null;
    }
    return null;
  },

  /**
   * Validate address data
   * @param {object} address - Address object
   * @returns {object} - { valid: boolean, errors: [] }
   */
  validateAddress: (address) => {
    const errors = [];

    if (!address.label || address.label.trim().length === 0) {
      errors.push("Label is required");
    }
    if (!address.line1 || address.line1.trim().length === 0) {
      errors.push("Address line 1 is required");
    }
    if (!address.city || address.city.trim().length === 0) {
      errors.push("City is required");
    }
    if (!address.state || address.state.trim().length === 0) {
      errors.push("State is required");
    }
    if (!address.postal_code || address.postal_code.trim().length === 0) {
      errors.push("Postal code is required");
    } else if (!/^\d{6}$/.test(address.postal_code)) {
      errors.push("Postal code must be 6 digits");
    }
    if (address.phone && !/^\d{10}$/.test(address.phone)) {
      errors.push("Phone must be 10 digits");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Format address for display
   * @param {object} address - Address object
   * @returns {string} - Formatted address string
   */
  formatAddress: (address) => {
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country || "India",
    ].filter(Boolean);

    return parts.join(", ");
  },

  /**
   * Create address template
   * @returns {object} - Empty address template
   */
  createAddressTemplate: () => {
    return {
      label: "",
      tag: "home",
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    };
  },

  /**
   * Validate address with pincode serviceability check
   * @param {object} address - Address object
   * @param {boolean} checkServiceability - Whether to check pincode serviceability
   * @returns {Promise<object>} - { valid, errors, warnings, shippingInfo }
   */
  validateAddressWithPincode: async (address, checkServiceability = true) => {
    const errors = [];
    const warnings = [];
    let shippingInfo = null;

    // Basic validation
    if (!address.label || address.label.trim().length === 0) {
      errors.push("Label is required");
    }
    if (!address.line1 || address.line1.trim().length === 0) {
      errors.push("Address line 1 is required");
    }
    if (!address.city || address.city.trim().length === 0) {
      errors.push("City is required");
    }
    if (!address.state || address.state.trim().length === 0) {
      errors.push("State is required");
    }

    // Pincode validation
    if (!address.postal_code || address.postal_code.trim().length === 0) {
      errors.push("Postal code is required");
    } else if (!/^\d{6}$/.test(address.postal_code)) {
      errors.push("Postal code must be 6 digits");
    } else if (checkServiceability) {
      // Check if pincode is serviceable
      try {
        const result = await shippingService.checkPincode(address.postal_code);
        shippingInfo = result;

        if (!result.serviceable) {
          warnings.push(
            `Delivery may not be available for pincode ${address.postal_code}. ` +
              `You can still save this address for future use.`
          );
        }
      } catch (error) {
        console.error("Error checking pincode serviceability:", error);
        warnings.push("Unable to verify delivery availability for this pincode.");
      }
    }

    // Phone validation
    if (address.phone && !/^\d{10}$/.test(address.phone)) {
      errors.push("Phone must be 10 digits");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      shippingInfo,
    };
  },

  /**
   * Check if user can order to this address
   * @param {object} address - Address object
   * @returns {Promise<boolean>}
   */
  isAddressServiceable: async (address) => {
    if (!address.postal_code) return false;

    try {
      const result = await shippingService.checkPincode(address.postal_code);
      return result.serviceable;
    } catch (error) {
      console.error("Error checking address serviceability:", error);
      return false;
    }
  },

  /**
   * Get shipping details for address
   * @param {object} address - Address object
   * @returns {Promise<object|null>}
   */
  getAddressShippingInfo: async (address) => {
    if (!address.postal_code) return null;

    try {
      const result = await shippingService.checkPincode(address.postal_code);
      return result.serviceable ? result.data : null;
    } catch (error) {
      console.error("Error getting shipping info:", error);
      return null;
    }
  },
};
