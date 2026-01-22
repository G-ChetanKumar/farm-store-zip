import axios from "axios";
import BASE_URL from "../Config";

/**
 * Centralized Axios Instance for Admin Panel
 * 
 * Features:
 * - Auto-adds JWT token to all requests
 * - Handles 401 (unauthorized) errors globally
 * - Consistent error handling
 * - Request/Response logging (can be disabled in production)
 * - Loading state management
 * - Retry logic for failed requests
 */

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Enable cookies for secure token storage
  timeout: 30000, // 30 seconds
});

// Track active requests for loading state
let activeRequests = 0;
const loadingCallbacks = new Set();

// Subscribe to loading state changes
export const subscribeToLoading = (callback) => {
  loadingCallbacks.add(callback);
  return () => loadingCallbacks.delete(callback);
};

const notifyLoadingChange = (isLoading) => {
  loadingCallbacks.forEach(callback => callback(isLoading));
};

// Request Interceptor - Add auth token to every request (except login)
apiClient.interceptors.request.use(
  (config) => {
    // Increment active requests counter
    activeRequests++;
    if (activeRequests === 1) {
      notifyLoadingChange(true);
    }

    // List of endpoints that don't need authentication (PUBLIC endpoints)
    const publicEndpoints = [
      "/api/admin/admin-login",           // Admin login
      "/api/admin/get-admin",             // Get admin by ID (public)
      "/api/v1/auth/request-otp",         // OTP request
      "/api/v1/auth/verify-otp",          // OTP verification
      "/api/v1/auth/resend-otp",          // Resend OTP
      "/api/user/login",                  // User login
    ];

    // Check if current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    // Only add token/CSRF if NOT a public endpoint
    if (!isPublicEndpoint) {
      // OPTION 1: Try CSRF token first (new secure method)
      const csrfToken = localStorage.getItem("csrfToken");
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
      
      // OPTION 2: Fallback to Bearer token for backward compatibility
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Note: If using cookies, tokens are sent automatically
      // No need to manually add them here
    }

    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
      if (config.headers.Authorization) {
        console.log(`🔐 Auth: Bearer token attached`);
      } else if (isPublicEndpoint) {
        console.log(`🌐 Public endpoint - No token needed`);
      }
    }

    return config;
  },
  (error) => {
    // Decrement counter on error
    activeRequests--;
    if (activeRequests === 0) {
      notifyLoadingChange(false);
    }
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Decrement active requests counter
    activeRequests--;
    if (activeRequests === 0) {
      notifyLoadingChange(false);
    }

    // Log responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Decrement active requests counter
    activeRequests--;
    if (activeRequests === 0) {
      notifyLoadingChange(false);
    }

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          console.error("🔒 Unauthorized: Token invalid or expired");
          
          // Try to refresh token first (if using new security system)
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              console.log("🔄 Attempting token refresh...");
              const response = await apiClient.post("/api/admin/refresh-token");
              
              if (response.data.success && response.data.csrfToken) {
                // Update CSRF token
                localStorage.setItem("csrfToken", response.data.csrfToken);
                console.log("✅ Token refreshed successfully");
                
                // Retry original request
                return apiClient(originalRequest);
              }
            } catch (refreshError) {
              console.error("❌ Token refresh failed:", refreshError);
              // Fall through to logout
            }
          }
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/authentication/sign-in")) {
            localStorage.removeItem("token");
            localStorage.removeItem("csrfToken");
            localStorage.removeItem("admin");
            window.location.href = "/authentication/sign-in";
          }
          break;

        case 403:
          // Forbidden - No permission
          console.error("⛔ Forbidden: Insufficient permissions");
          if (data.message) {
            console.error("Reason:", data.message);
          }
          break;

        case 404:
          // Not Found
          console.error("🔍 Not Found:", error.config.url);
          break;

        case 422:
          // Validation Error
          console.error("⚠️ Validation Error:", data.message || data.error);
          break;

        case 500:
          // Server Error
          console.error("💥 Server Error:", data.message || data.error);
          break;

        case 503:
          // Service Unavailable
          console.error("🔧 Service Unavailable: Server is temporarily down");
          break;

        default:
          console.error(`❌ API Error (${status}):`, data.message || data.error || error.message);
      }

      // Enhance error object with user-friendly message
      error.userMessage = getUserFriendlyMessage(status, data);
    } else if (error.request) {
      // Request made but no response received
      console.error("🌐 Network Error: No response from server");
      error.userMessage = "Network error. Please check your internet connection.";
    } else {
      // Something else happened
      console.error("❌ Error:", error.message);
      error.userMessage = "An unexpected error occurred. Please try again.";
    }

    return Promise.reject(error);
  }
);

// Helper function to get user-friendly error messages
const getUserFriendlyMessage = (status, data) => {
  const message = data?.message || data?.error;
  
  switch (status) {
    case 401:
      return "Session expired. Please login again.";
    case 403:
      return message || "You don't have permission to perform this action.";
    case 404:
      return message || "The requested resource was not found.";
    case 422:
      return message || "Please check your input and try again.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return message || "An error occurred. Please try again.";
  }
};

export default apiClient;
