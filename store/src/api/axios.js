import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Centralized Axios Instance for Customer Store
 * 
 * Features:
 * - Auto-adds JWT token to all requests
 * - Handles 401 (unauthorized) errors globally
 * - Consistent error handling
 */

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // ✅ Send cookies with requests (for secure auth)
});

// Request Interceptor - Add auth token to every request (except login/register)
apiClient.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    if (import.meta.env.DEV) {
      console.log(`🔍 [axios] Preparing request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔍 [axios] withCredentials: ${config.withCredentials}`);
      console.log(`🔍 [axios] Cookies will be sent automatically`);
    }
    
    // List of PUBLIC endpoints that don't need authentication
    const publicEndpoints = [
      // Authentication
      "/user/login",
      "/user/add-user",
      "/v1/auth/request-otp",
      "/v1/auth/verify-otp",
      "/v1/auth/resend-otp",
      "/v1/auth/complete-profile",
      
      // Browse as guest (Read-only)
      "/product/get-product",
      "/product/get-id-product",
      "/category/get-category",
      "/category/get-by-id-category",
      "/subcategory/get-sub-category",
      "/subcategory/get-by-id-subcategory",
      "/super-category/get-super-category",
      "/brand/get-brand",
      "/brand/get-by-id-brand",
      "/crop/get-crops",
      "/crop/get-by-id-crop",
      "/pest/get-pests",
      "/counter/get-counter",
      
      // Membership (Get plans is public)
      "/v1/membership/plans",
      
      // Razorpay (needs to check if these should be protected)
      "/razorpay/create-razorpay-order",
      "/razorpay/verify-razorpay-payment",
    ];

    // Check if current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    // Only add token if NOT a public endpoint
    if (!isPublicEndpoint) {
      // ✅ FIX: Priority order for authentication
      // 1. CSRF Token (most secure - required with cookie auth)
      // 2. Bearer Token (legacy fallback)
      // 3. HTTP-only cookie (automatic, sent by browser)
      
      const csrfToken = localStorage.getItem("csrfToken");
      const token = localStorage.getItem("token") || 
                    localStorage.getItem("authToken");
      
      if (import.meta.env.DEV) {
        console.log(`🔍 [axios] Checking tokens for protected endpoint`);
        console.log(`🔍 [axios] - csrfToken in localStorage:`, csrfToken ? 'YES' : 'NO');
        console.log(`🔍 [axios] - token in localStorage:`, token ? 'YES' : 'NO');
        console.log(`🔍 [axios] - HTTP-only cookie will be sent automatically`);
      }
      
      // ✅ CRITICAL: Add CSRF token (required for cookie-based auth)
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
        if (import.meta.env.DEV) {
          console.log(`🔐 [axios] Added X-CSRF-Token header`);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn(`⚠️ [axios] No CSRF token available for: ${config.url}`);
          console.warn(`⚠️ [axios] This may cause 401 errors! Make sure to login again.`);
        }
      }
      
      // Add Bearer token (for backward compatibility / fallback)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) {
          console.log(`🔐 [axios] Added Authorization header (Bearer token)`);
        }
      }
      
      if (!token && !csrfToken) {
        // Log warning if tokens are missing
        if (import.meta.env.DEV) {
          console.warn(`⚠️ [axios] No tokens available for protected endpoint: ${config.url}`);
          console.warn(`⚠️ [axios] Relying ONLY on HTTP-only cookie (accessToken)`);
          console.warn(`⚠️ [axios] If you get 401, check that login stored csrfToken`);
        }
      }
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
      if (config.headers.Authorization) {
        console.log(`🔐 Auth: Bearer token attached`);
      } else if (isPublicEndpoint) {
        console.log(`✅ Public endpoint - No token needed`);
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common errors and auto-refresh tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // ✅ FIX: Smart 401 handling with token refresh
      if (status === 401 && !originalRequest._retry) {
        const errorCode = data?.code;
        const errorMessage = data?.message;
        
        console.log(`🔒 [axios] 401 Unauthorized received:`, {
          url: originalRequest.url,
          code: errorCode,
          message: errorMessage
        });
        
        // ✅ Check if error is TOKEN_EXPIRED (can be refreshed)
        if (errorCode === "TOKEN_EXPIRED" || errorMessage?.includes("expired")) {
          console.log("🔄 [axios] Token expired - Attempting automatic refresh...");
          
          // Prevent multiple simultaneous refresh attempts
          if (isRefreshing) {
            // Queue this request to retry after refresh completes
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((csrfToken) => {
                // Update request with new CSRF token
                originalRequest.headers["X-CSRF-Token"] = csrfToken;
                return apiClient(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          // Try to refresh token
          try {
            const response = await fetch(`${BASE_URL}/v1/auth/refresh-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // ✅ Send refreshToken cookie
            });

            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.csrfToken) {
                // ✅ Update CSRF token (critical!)
                localStorage.setItem("csrfToken", data.csrfToken);
                
                // ✅ Update Bearer token if provided (optional)
                if (data.token) {
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("authToken", data.token);
                }

                console.log("✅ [axios] Token refreshed successfully");
                console.log("✅ [axios] New CSRF token stored");
                
                // Update original request headers with new tokens
                originalRequest.headers["X-CSRF-Token"] = data.csrfToken;
                if (data.token) {
                  originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
                }

                // Process all queued requests with new CSRF token
                processQueue(null, data.csrfToken);
                isRefreshing = false;

                // ✅ Retry original request with new tokens
                console.log("🔄 [axios] Retrying original request with new tokens");
                return apiClient(originalRequest);
              }
            }

            throw new Error("Token refresh failed - invalid response");
          } catch (refreshError) {
            console.error("❌ [axios] Token refresh failed:", refreshError);
            processQueue(refreshError, null);
            isRefreshing = false;
            
            // ✅ Clear all auth data before logout
            console.log("🚪 [axios] Logging out due to failed token refresh");
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("csrfToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userType");
            
            // Redirect to login
            if (!window.location.pathname.includes('/login')) {
              window.location.href = "/login";
            }
            
            return Promise.reject(refreshError);
          }
        } else {
          // ✅ Other 401 errors (INVALID_TOKEN, NO_TOKEN, etc.)
          console.error("🔒 [axios] Auth failed:", errorCode || "UNKNOWN");
          console.error("🔒 [axios] Message:", errorMessage);
          console.error("🔒 [axios] Failed endpoint:", originalRequest.url);
          
          // ✅ Don't auto-logout for optional auth endpoints
          const optionalAuthEndpoints = [
            "/product/",
            "/category/",
            "/subcategory/",
            "/brand/",
            "/counter/get-counter",
            "/pest/",
            "/crop/"
            // Note: Removed /v1/addresses - addresses SHOULD require auth
          ];
          
          const isOptionalAuth = optionalAuthEndpoints.some(endpoint => 
            originalRequest.url.includes(endpoint)
          );
          
          if (isOptionalAuth) {
            console.log("⚠️ [axios] 401 on optional endpoint - NOT logging out");
            return Promise.reject(error);
          }
          
          // ✅ CRITICAL FIX: Check if user has tokens in localStorage
          // If tokens exist, this might be a temporary/race condition issue
          // Don't immediately logout - let the app retry the request
          const hasStoredTokens = localStorage.getItem("csrfToken") || 
                                 localStorage.getItem("token") || 
                                 localStorage.getItem("authToken");
          
          if (hasStoredTokens) {
            console.warn("⚠️ [axios] 401 but tokens exist in localStorage");
            console.warn("⚠️ [axios] This might be a race condition - NOT logging out");
            console.warn("⚠️ [axios] Failed endpoint:", originalRequest.url);
            // Don't logout - just reject the request and let the app handle it
            return Promise.reject(error);
          }
          
          // ✅ Only logout if NO tokens exist (user is truly not authenticated)
          console.error("🔒 [axios] CRITICAL 401 - No tokens found");
          console.error("🔒 [axios] Error code:", errorCode);
          console.error("🔒 [axios] Failed endpoint:", originalRequest.url);
          
          // Only logout if not already on login page
          if (!window.location.pathname.includes('/login')) {
            console.log("🚪 [axios] Logging out due to no stored tokens");
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("csrfToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userType");
            
            window.location.href = "/login";
          }
        }
      }

      // Handle other error codes
      switch (status) {
        case 403:
          console.error("⛔ Forbidden: Insufficient permissions");
          break;

        case 404:
          console.error("🔍 Not Found:", error.config.url);
          break;

        case 500:
          console.error("💥 Server Error:", data.message);
          break;

        default:
          console.error(`❌ API Error (${status}):`, data.message || error.message);
      }
    } else if (error.request) {
      console.error("🌐 Network Error: No response from server");
    } else {
      console.error("❌ Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
