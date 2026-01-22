import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Counter/Store Service for Customer Store
 * Handles all counter-related API calls and store management
 */

export const counterService = {
  /**
   * Get all counters/stores
   * @returns {Promise<Array>}
   */
  getAllCounters: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/counter/get-counters`);
      return response.data;
    } catch (error) {
      console.error("Error fetching counters:", error);
      throw error;
    }
  },

  /**
   * Get counter by ID
   * @param {string} id - Counter ID
   * @returns {Promise<object>}
   */
  getCounterById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/counter/get-id-counter/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching counter by ID:", error);
      throw error;
    }
  },

  /**
   * Get counters by pincode
   * @param {string} pincode - Area pincode
   * @returns {Promise<Array>}
   */
  getCountersByPincode: async (pincode) => {
    try {
      const response = await axios.get(`${BASE_URL}/counter/get-counters`);
      return response.data.filter((counter) => counter.pinCode === pincode);
    } catch (error) {
      console.error("Error fetching counters by pincode:", error);
      throw error;
    }
  },

  /**
   * Get selected counter from localStorage
   * @returns {object|null}
   */
  getSelectedCounter: () => {
    try {
      const counter = localStorage.getItem("selectedCounter");
      return counter ? JSON.parse(counter) : null;
    } catch (error) {
      console.error("Error getting selected counter:", error);
      return null;
    }
  },

  /**
   * Set selected counter in localStorage and backend
   * @param {object} counter - Counter object to save
   */
  setSelectedCounter: async (counter) => {
    try {
      // Save to localStorage
      localStorage.setItem("selectedCounter", JSON.stringify(counter));
      
      // Save to backend if user is logged in
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData._id && counter._id) {
          try {
            await axios.post(`${BASE_URL}/user-counter/set-preferred-counter`, {
              userId: userData._id,
              counterId: counter._id
            });
            console.log('✅ Counter selection saved to backend');
          } catch (backendError) {
            console.error('⚠️ Failed to save counter selection to backend:', backendError);
            // Don't throw error - localStorage save still works
          }
        }
      }
    } catch (error) {
      console.error("Error setting selected counter:", error);
    }
  },

  /**
   * Clear selected counter from localStorage
   */
  clearSelectedCounter: () => {
    try {
      localStorage.removeItem("selectedCounter");
    } catch (error) {
      console.error("Error clearing selected counter:", error);
    }
  },

  /**
   * Check if user has selected a counter
   * @returns {boolean}
   */
  hasSelectedCounter: () => {
    const counter = counterService.getSelectedCounter();
    return counter !== null && counter._id !== undefined;
  },

  /**
   * Get delivery location from localStorage
   * @returns {object}
   */
  getDeliveryLocation: () => {
    try {
      const location = localStorage.getItem("deliveryLocation");
      return location ? JSON.parse(location) : { pincode: "", city: "" };
    } catch (error) {
      console.error("Error getting delivery location:", error);
      return { pincode: "", city: "" };
    }
  },

  /**
   * Set delivery location in localStorage
   * @param {object} location - Location object {pincode, city}
   */
  setDeliveryLocation: (location) => {
    try {
      localStorage.setItem("deliveryLocation", JSON.stringify(location));
    } catch (error) {
      console.error("Error setting delivery location:", error);
    }
  },

  /**
   * Format counter data for display
   * @param {object} counter - Counter object
   * @returns {object}
   */
  formatCounterData: (counter) => {
    return {
      _id: counter._id,
      type: counter.counterName,
      agent: counter.agentName,
      role: "Agent",
      address: counter.address,
      landmark: counter.landMark,
      pincode: counter.pinCode,
      phone: counter.agentNumber,
      locationDirection: counter.location_direction,
      storeType: "booking", // Can be 'booking' or 'store'
      buttonText: "Call Agent",
    };
  },

  /**
   * Validate counter availability for product
   * @param {string} counterId - Counter ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>}
   */
  validateCounterAvailability: async (counterId, productId) => {
    try {
      // This would check if the counter has the product in stock
      // For now, returns true - implement based on your inventory system
      return true;
    } catch (error) {
      console.error("Error validating counter availability:", error);
      return false;
    }
  },

  /**
   * Get nearest counters based on user location
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @returns {Promise<Array>}
   */
  getNearestCounters: async (latitude, longitude) => {
    try {
      const allCounters = await counterService.getAllCounters();
      
      // If counters have lat/lng, calculate distance
      // For now, return all counters sorted by pincode
      return allCounters.sort((a, b) => a.pinCode.localeCompare(b.pinCode));
    } catch (error) {
      console.error("Error getting nearest counters:", error);
      throw error;
    }
  },

  /**
   * Search counters by name or location
   * @param {string} searchText - Search query
   * @returns {Promise<Array>}
   */
  searchCounters: async (searchText) => {
    try {
      const allCounters = await counterService.getAllCounters();
      const lowerSearch = searchText.toLowerCase();

      return allCounters.filter(
        (counter) =>
          counter.counterName.toLowerCase().includes(lowerSearch) ||
          counter.agentName.toLowerCase().includes(lowerSearch) ||
          counter.address.toLowerCase().includes(lowerSearch) ||
          counter.landMark.toLowerCase().includes(lowerSearch) ||
          counter.pinCode.includes(searchText)
      );
    } catch (error) {
      console.error("Error searching counters:", error);
      throw error;
    }
  },

  /**
   * Get store type (e-booking counter vs e-store)
   * @param {object} counter - Counter object
   * @returns {string}
   */
  getStoreType: (counter) => {
    // Logic to determine store type
    // For now, check if counterName contains 'E-Store' or similar
    if (counter.counterName && counter.counterName.toLowerCase().includes("e-store")) {
      return "store";
    }
    return "booking";
  },

  /**
   * Calculate distance between two points (Haversine formula)
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} - Distance in kilometers
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

export default counterService;
