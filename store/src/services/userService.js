import apiClient from "../api/axios";

/**
 * User Service for Customer Store
 * Handles user-related API calls
 */

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<object>}
   */
  getMyProfile: async () => {
    const response = await apiClient.get("/user/me");
    return response.data;
  },

  /**
   * Update current user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>}
   */
  updateMyProfile: async (userData) => {
    const response = await apiClient.put("/user/me", userData);
    return response.data;
  },

  /**
   * Get user statistics
   * @returns {Promise<object>} - User stats including orders, cart, addresses, and Kisan Cash
   */
  getUserStats: async () => {
    const response = await apiClient.get("/user/user-stats");
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(`/user/get-user-by-id/${userId}`);
    return response.data;
  },
};
