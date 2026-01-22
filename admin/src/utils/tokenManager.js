import apiClient from "../api/axios";

/**
 * Token Manager
 * 
 * Handles:
 * - Token storage
 * - Token refresh
 * - Session timeout detection
 * - Auto-logout
 */

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";
const ADMIN_KEY = "admin";

// Warning time before expiry (2 minutes = 120 seconds)
const WARNING_TIME_BEFORE_EXPIRY = 120; // seconds

class TokenManager {
  constructor() {
    this.expiryCheckInterval = null;
    this.onTokenExpiringSoon = null;
    this.onTokenExpired = null;
    this.isRefreshing = false;
  }

  /**
   * Save tokens after login
   */
  saveTokens(accessToken, refreshToken, expiresIn) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Calculate expiry timestamp
    const expiryTimestamp = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
    
    // Start monitoring token expiry
    this.startExpiryMonitoring();
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry() {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Check how many seconds until token expires
   */
  getSecondsUntilExpiry() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return 0;
    
    const now = Date.now();
    const secondsRemaining = Math.floor((expiry - now) / 1000);
    return Math.max(0, secondsRemaining);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired() {
    const secondsRemaining = this.getSecondsUntilExpiry();
    return secondsRemaining <= 0;
  }

  /**
   * Check if token is expiring soon (within 2 minutes)
   */
  isTokenExpiringSoon() {
    const secondsRemaining = this.getSecondsUntilExpiry();
    return secondsRemaining > 0 && secondsRemaining <= WARNING_TIME_BEFORE_EXPIRY;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing) {
      console.log("Token refresh already in progress");
      return false;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error("No refresh token available");
      return false;
    }

    this.isRefreshing = true;

    try {
      console.log("🔄 Refreshing access token...");
      
      const response = await apiClient.post("/api/admin/refresh-token", {
        refreshToken: refreshToken,
      });

      if (response.data.success) {
        const { token, expiresIn } = response.data;
        
        // Update access token and expiry
        localStorage.setItem(TOKEN_KEY, token);
        const expiryTimestamp = Date.now() + (expiresIn * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
        
        console.log("✅ Token refreshed successfully");
        console.log(`⏰ New expiry: ${new Date(expiryTimestamp).toLocaleTimeString()}`);
        
        return true;
      } else {
        console.error("Token refresh failed:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error.response?.data?.message || error.message);
      
      // If refresh token is invalid/expired, logout user
      if (error.response?.status === 401) {
        this.clearTokens();
        if (this.onTokenExpired) {
          this.onTokenExpired();
        }
      }
      
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Start monitoring token expiry
   */
  startExpiryMonitoring() {
    // Clear existing interval
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
    }

    // Check every 10 seconds
    this.expiryCheckInterval = setInterval(() => {
      const secondsRemaining = this.getSecondsUntilExpiry();
      
      // Token expired - auto logout
      if (secondsRemaining <= 0) {
        console.log("🔴 Token expired - logging out");
        this.stopExpiryMonitoring();
        if (this.onTokenExpired) {
          this.onTokenExpired();
        }
      }
      // Token expiring soon (2 minutes) - show warning
      else if (secondsRemaining <= WARNING_TIME_BEFORE_EXPIRY && secondsRemaining > WARNING_TIME_BEFORE_EXPIRY - 10) {
        console.log(`⚠️ Token expiring in ${secondsRemaining} seconds`);
        if (this.onTokenExpiringSoon) {
          this.onTokenExpiringSoon(secondsRemaining);
        }
      }
    }, 10000); // Check every 10 seconds

    console.log("✅ Token expiry monitoring started");
  }

  /**
   * Stop monitoring token expiry
   */
  stopExpiryMonitoring() {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
      console.log("⏹️ Token expiry monitoring stopped");
    }
  }

  /**
   * Clear all tokens and stop monitoring
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this.stopExpiryMonitoring();
    console.log("🗑️ Tokens cleared");
  }

  /**
   * Logout - clear tokens and call logout API
   */
  async logout() {
    const refreshToken = this.getRefreshToken();
    
    // Clear tokens first
    this.clearTokens();
    
    // Call logout API to invalidate refresh token on server
    if (refreshToken) {
      try {
        await apiClient.post("/api/admin/logout", { refreshToken });
        console.log("✅ Logout API called");
      } catch (error) {
        console.error("Logout API error:", error.message);
      }
    }
  }

  /**
   * Set callback for when token is expiring soon
   */
  setOnTokenExpiringSoon(callback) {
    this.onTokenExpiringSoon = callback;
  }

  /**
   * Set callback for when token expires
   */
  setOnTokenExpired(callback) {
    this.onTokenExpired = callback;
  }
}

// Export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;
