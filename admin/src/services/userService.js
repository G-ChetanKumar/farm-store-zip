import apiClient from "../api/axios";

/**
 * User Service
 * Handles all user-related API calls
 */

export const userService = {
  /**
   * Get all users
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  getAllUsers: async (filters = {}) => {
    const response = await apiClient.get("/api/admin/users", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get pending users (awaiting approval)
   * @returns {Promise<Array>}
   */
  getPendingUsers: async () => {
    const response = await apiClient.get("/api/admin/users/pending");
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/api/user/get-user-by-id/${id}`);
    return response.data;
  },

  /**
   * Create user (Admin only)
   * @param {object} userData - User data
   * @returns {Promise<object>}
   */
  createUser: async (userData) => {
    const response = await apiClient.post("/api/admin/users", userData);
    return response.data;
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise<object>}
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/api/user/update-user/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/user/delete-user/${id}`);
    return response.data;
  },

  /**
   * Approve user (Agri-Retailer/Agent)
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  approveUser: async (id) => {
    const response = await apiClient.patch(`/api/admin/users/${id}/approve`);
    return response.data;
  },

  /**
   * Reject user
   * @param {string} id - User ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<object>}
   */
  rejectUser: async (id, reason) => {
    const response = await apiClient.patch(`/api/admin/users/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  /**
   * Block user
   * @param {string} id - User ID
   * @param {string} reason - Block reason
   * @returns {Promise<object>}
   */
  blockUser: async (id, reason) => {
    const response = await apiClient.patch(`/api/admin/users/${id}/block`, {
      reason,
    });
    return response.data;
  },

  /**
   * Unblock user
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  unblockUser: async (id) => {
    const response = await apiClient.patch(`/api/admin/users/${id}/unblock`);
    return response.data;
  },

  /**
   * Get user cart and payment info
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  getUserCartInfo: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}/cart`);
    return response.data;
  },

  /**
   * Check user cart validity (stock, prices, availability)
   * @param {string} id - User ID
   * @returns {Promise<object>} - { success, valid, data, issues, has_issues, summary }
   */
  checkUserCart: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}/cart/check`);
    return response.data;
  },
};
