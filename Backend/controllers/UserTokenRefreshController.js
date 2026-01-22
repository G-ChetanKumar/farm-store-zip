const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const config = require("../config/db");

/**
 * User Token Refresh Controller
 * 
 * For Farmer, Agri-Retailer, Agent
 * Similar to AdminTokenRefreshController but for regular users
 */

/**
 * Refresh Access Token for Users
 */
exports.refreshAccessToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token required" 
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || config.jwtSecret
      );
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired refresh token",
        error: err.message 
      });
    }

    // Check if it's a refresh token
    if (decoded.tokenType !== "refresh") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token type" 
      });
    }

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token mismatch. Please login again." 
      });
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token expired. Please login again." 
      });
    }

    // Check account status
    if (user.status === "blocked") {
      return res.status(403).json({ 
        success: false,
        message: "Account blocked. Contact support." 
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ 
        success: false,
        message: "Account registration rejected." 
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user._id,
        user_type: user.user_type,
        mobile: user.mobile
      }, 
      config.jwtSecret, 
      {
        expiresIn: "30m"
      }
    );

    // Generate new CSRF token
    const {generateCSRFToken} = require("../middlewares/SecurityMiddleware");
    const newCsrfToken = generateCSRFToken();

    // Update security info
    user.csrfToken = newCsrfToken;
    user.csrfTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    user.lastActivity = new Date();
    await user.save();

    // Update cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 60 * 1000
    });

    res.json({ 
      success: true,
      csrfToken: newCsrfToken,
      expiresIn: 1800,
      message: "Token refreshed successfully"
    });

  } catch (error) {
    console.error("User token refresh error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to refresh token",
      error: error.message 
    });
  }
};

/**
 * Logout User - Invalidate Refresh Token
 */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: "Refresh token required" 
      });
    }

    // Decode token to get user ID
    const decoded = jwt.decode(refreshToken);
    
    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (user) {
        // Clear refresh token and security info
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        user.csrfToken = null;
        user.csrfTokenExpiry = null;
        await user.save();
      }
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ 
      success: true,
      message: "Logged out successfully" 
    });

  } catch (error) {
    console.error("User logout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to logout",
      error: error.message 
    });
  }
};

/**
 * Validate Token for User
 */
exports.validateToken = async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        valid: false,
        message: "No token provided" 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          valid: false,
          message: "User not found" 
        });
      }

      // Check account status
      if (user.status === "blocked" || user.status === "rejected") {
        return res.status(403).json({ 
          success: false,
          valid: false,
          message: `Account ${user.status}` 
        });
      }

      // Update last activity
      user.lastActivity = new Date();
      await user.save();

      res.json({ 
        success: true,
        valid: true,
        expiresAt: decoded.exp,
        timeRemaining: decoded.exp - Math.floor(Date.now() / 1000),
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          user_type: user.user_type,
          status: user.status
        }
      });

    } catch (err) {
      return res.status(401).json({ 
        success: false,
        valid: false,
        message: "Invalid or expired token",
        error: err.message 
      });
    }

  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ 
      success: false,
      valid: false,
      message: "Failed to validate token",
      error: error.message 
    });
  }
};
