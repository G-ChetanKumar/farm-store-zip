import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Authentication Service for Customer Store
 * Handles user authentication and registration
 */

export const authService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{token: string, user: object, csrfToken: string}>}
   */
  login: async (email, password) => {
    const response = await axios.post(`${BASE_URL}/user/login`, {
      email,
      password,
    }, {
      withCredentials: true  // ✅ Ensure cookies are sent/received
    });

    // ✅ FIX: Extract ALL tokens from response (including csrfToken)
    const { token, user, csrfToken } = response.data;

    console.log("🔑 Login response received:", { 
      hasToken: !!token, 
      hasCsrfToken: !!csrfToken,
      userName: user?.name,
      userType: user?.user_type 
    });

    // ✅ CRITICAL: Store CSRF token (required for all protected requests)
    if (csrfToken) {
      localStorage.setItem("csrfToken", csrfToken);
      console.log("✅ CSRF token stored");
    } else {
      console.warn("⚠️ No CSRF token in response! Auth may fail.");
    }

    // Store authentication data in BOTH locations for compatibility
    if (token) {
      localStorage.setItem("token", token); // For axios interceptor
      localStorage.setItem("authToken", token); // Legacy support
    }
    
    localStorage.setItem("user", JSON.stringify(user));
    if (user.user_type) {
      localStorage.setItem("userType", user.user_type);
    }

    console.log("✅ Login successful - All tokens stored");
    console.log("✅ Token (first 20 chars):", token?.substring(0, 20) + "...");
    console.log("✅ User:", user.name, "Type:", user.user_type);
    
    // Verify storage
    setTimeout(() => {
      console.log("🔍 Verifying tokens in localStorage:", {
        token: !!localStorage.getItem("token"),
        authToken: !!localStorage.getItem("authToken"),
        csrfToken: !!localStorage.getItem("csrfToken"),
        user: !!localStorage.getItem("user")
      });
    }, 100);

    return { token, user, csrfToken };
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>}
   */
  register: async (userData) => {
    const response = await axios.post(`${BASE_URL}/user/add-user`, userData);
    return response.data;
  },

  /**
   * Request OTP for mobile login
   * @param {string} mobile - Mobile number
   * @param {string} userType - User type (Farmer, Agri-Retailer, Agent)
   * @returns {Promise<object>}
   */
  requestOTP: async (mobile, userType) => {
    const response = await axios.post(`${BASE_URL}/v1/auth/request-otp`, {
      mobile,
      user_type: userType,
    });
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} mobile - Mobile number
   * @param {string} otp - OTP code
   * @returns {Promise<{token: string, user: object, csrfToken: string}>}
   */
  verifyOTP: async (mobile, otp) => {
    const response = await axios.post(`${BASE_URL}/v1/auth/verify-otp`, {
      mobile,
      otp,
    }, {
      withCredentials: true  // ✅ Ensure cookies are sent/received
    });

    if (response.data.success) {
      // ✅ FIX: Extract ALL tokens from response (csrfToken may be in data or root)
      const token = response.data.data?.token || response.data.token;
      const user = response.data.data?.user || response.data.user;
      const csrfToken = response.data.csrfToken || response.data.data?.csrfToken;

      console.log("🔑 OTP Login response received:", { 
        hasToken: !!token, 
        hasCsrfToken: !!csrfToken,
        userName: user?.name || user?.mobile 
      });

      // ✅ CRITICAL: Store CSRF token (required for all protected requests)
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
        console.log("✅ CSRF token stored");
      } else {
        console.warn("⚠️ No CSRF token in response! Auth may fail.");
      }

      // Store authentication data in BOTH locations for compatibility
      if (token) {
        localStorage.setItem("token", token); // For axios interceptor
        localStorage.setItem("authToken", token); // Legacy support
      }
      
      localStorage.setItem("user", JSON.stringify(user));
      if (user.user_type) {
        localStorage.setItem("userType", user.user_type);
      }

      console.log("✅ OTP Login successful - All tokens stored for user:", user.name || user.mobile);
      console.log("✅ User type:", user.user_type);

      return { token, user, csrfToken };
    }

    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} mobile - Mobile number
   * @param {string} userType - User type
   * @returns {Promise<object>}
   */
  resendOTP: async (mobile, userType) => {
    const response = await axios.post(`${BASE_URL}/v1/auth/resend-otp`, {
      mobile,
      user_type: userType,
    });
    return response.data;
  },

  /**
   * Complete user profile after OTP verification
   * @param {object} profileData - Profile completion data
   * @returns {Promise<object>}
   */
  completeProfile: async (profileData) => {
    const response = await axios.post(`${BASE_URL}/v1/auth/complete-profile`, profileData);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise<object>}
   */
  getCurrentUser: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await axios.get(`${BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Update user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>}
   */
  updateProfile: async (userData) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await axios.put(`${BASE_URL}/user/me`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Logout user
   * Clears all authentication data from localStorage and cookies
   */
  logout: () => {
    // Clear localStorage
    localStorage.removeItem("token"); // Primary token
    localStorage.removeItem("authToken"); // Legacy token
    localStorage.removeItem("csrfToken"); // CSRF token
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("cartItems"); // Clear cart on logout
    
    console.log("🚪 Logged out - All tokens cleared");
    
    window.location.href = "/";
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  /**
   * Get current user from localStorage
   * @returns {object|null}
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get user type from localStorage
   * @returns {string|null} - "Farmer", "Agri-Retailer", or "Agent"
   */
  getUserType: () => {
    const directUserType = localStorage.getItem("userType");
    if (directUserType) return directUserType;

    const user = authService.getStoredUser();
    return user?.user_type || null;
  },
};
