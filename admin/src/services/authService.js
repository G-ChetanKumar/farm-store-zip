import apiClient from "../api/axios";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Admin Login
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<{token: string, admin: object}>}
   */
  adminLogin: async (username, password) => {
    const response = await apiClient.post("/api/admin/admin-login", {
      username,
      password,
    });

    // Store token and admin data
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      if (response.data.admin) {
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
      }
    }

    return response.data;
  },

  /**
   * Admin Register
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<object>}
   */
  adminRegister: async (username, password) => {
    const response = await apiClient.post("/api/admin/admin-register", {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Get Admin Profile
   * @returns {Promise<object>}
   */
  getAdminProfile: async () => {
    const response = await apiClient.get("/api/admin/get-admin");
    return response.data;
  },

  /**
   * Update Admin Profile
   * @param {string} id - Admin ID
   * @param {object} data - Update data
   * @returns {Promise<object>}
   */
  updateAdmin: async (id, data) => {
    const response = await apiClient.patch(`/api/admin/admin-update/${id}`, data);
    return response.data;
  },

  /**
   * Logout
   * Clears local storage and redirects to login
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    window.location.href = "/authentication/sign-in";
  },

  /**
   * Check if admin is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Get current admin from localStorage
   * @returns {object|null}
   */
  getCurrentAdmin: () => {
    const adminStr = localStorage.getItem("admin");
    return adminStr ? JSON.parse(adminStr) : null;
  },
};
