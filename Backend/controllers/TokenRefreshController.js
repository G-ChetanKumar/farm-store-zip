const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

/**
 * Refresh Access Token
 * 
 * When access token expires (30 min), use refresh token to get new access token
 * without requiring user to login again.
 */
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

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
        process.env.ADMIN_REFRESH_SECRET || process.env.ADMIN_JWT_SECRET
      );
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired refresh token",
        error: err.message 
      });
    }

    // Check if it's a refresh token (not access token)
    if (decoded.tokenType !== "refresh") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token type" 
      });
    }

    // Find admin and verify refresh token matches
    const admin = await Admin.findById(decoded.userId);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    if (admin.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token mismatch. Please login again." 
      });
    }

    // Check if refresh token has expired
    if (admin.refreshTokenExpiry && admin.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token expired. Please login again." 
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: admin._id,
        user_type: "admin"
      }, 
      process.env.ADMIN_JWT_SECRET, 
      {
        expiresIn: "30m", // 30 minutes
      }
    );

    // Update last activity
    admin.lastActivity = new Date();
    await admin.save();

    res.json({ 
      success: true,
      token: newAccessToken,
      expiresIn: 1800, // 30 minutes in seconds
      message: "Token refreshed successfully"
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to refresh token",
      error: error.message 
    });
  }
};

/**
 * Logout - Invalidate Refresh Token
 * 
 * Removes refresh token from database so it can't be used anymore
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: "Refresh token required" 
      });
    }

    // Decode token to get user ID (don't verify as it might be expired)
    const decoded = jwt.decode(refreshToken);
    
    if (decoded && decoded.userId) {
      const admin = await Admin.findById(decoded.userId);
      if (admin) {
        // Clear refresh token
        admin.refreshToken = null;
        admin.refreshTokenExpiry = null;
        await admin.save();
      }
    }

    res.json({ 
      success: true,
      message: "Logged out successfully" 
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to logout",
      error: error.message 
    });
  }
};

/**
 * Validate Token
 * 
 * Check if current access token is still valid
 */
exports.validateToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        valid: false,
        message: "No token provided" 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      
      const admin = await Admin.findById(decoded.userId);
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          valid: false,
          message: "Admin not found" 
        });
      }

      // Update last activity
      admin.lastActivity = new Date();
      await admin.save();

      res.json({ 
        success: true,
        valid: true,
        expiresAt: decoded.exp,
        timeRemaining: decoded.exp - Math.floor(Date.now() / 1000),
        admin: {
          id: admin._id,
          username: admin.username,
          user_type: "admin"
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
