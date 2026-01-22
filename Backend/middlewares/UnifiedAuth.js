const jwt = require("jsonwebtoken");
const config = require("../config/db");

/**
 * Unified Authentication Middleware
 * 
 * Handles both Admin and User authentication
 * Supports both cookie-based (secure) and header-based (legacy) authentication
 * Tries multiple token sources and secrets
 */
module.exports = function (req, res, next) {
  // Try to get token from multiple sources (priority order)
  let tokenValue = null;
  
  // 1. Cookie (secure method - highest priority)
  if (req.cookies?.accessToken) {
    tokenValue = req.cookies.accessToken;
  }
  // 2. Authorization header (legacy method - fallback)
  else if (req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      tokenValue = authHeader.split(" ")[1];
    }
  }

  if (!tokenValue) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied",
      code: "NO_TOKEN"
    });
  }

  // Try to verify token with different secrets
  let decoded = null;
  let tokenType = null;
  
  // Try Admin JWT secret first
  try {
    decoded = jwt.verify(tokenValue, process.env.ADMIN_JWT_SECRET);
    tokenType = "admin";
    req.isAdmin = true;
  } catch (adminError) {
    // Try User JWT secret
    try {
      decoded = jwt.verify(tokenValue, config.jwtSecret);
      tokenType = "user";
      req.isAdmin = false;
    } catch (userError) {
      // Both failed
      if (adminError.name === "TokenExpiredError" || userError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false,
          message: "Token expired",
          code: "TOKEN_EXPIRED"
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: "Token is not valid",
        code: "INVALID_TOKEN"
      });
    }
  }

  // Attach user info to request
  req.user = decoded.userId;
  req.user_id = decoded.userId;
  req.user_type = decoded.user_type || (tokenType === "admin" ? "admin" : "user");
  req.mobile = decoded.mobile;
  
  next();
};
