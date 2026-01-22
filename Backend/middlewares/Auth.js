const jwt = require("jsonwebtoken");
const config = require("../config/db");

/**
 * Universal User Authentication Middleware
 * 
 * For all user types: Farmer, Agri-Retailer, Agent
 * Supports both cookie-based (secure) and header-based (legacy) authentication
 * Priority: Cookie > Authorization Header
 */
module.exports = function (req, res, next) {
  // Try to get token from cookie first (secure method)
  let token = req.cookies?.accessToken;
  
  // Fallback to Authorization header (for backward compatibility)
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    console.log("❌ [Auth] No token provided");
    console.log("❌ [Auth] Cookie accessToken:", req.cookies?.accessToken ? "Present" : "Missing");
    console.log("❌ [Auth] Authorization header:", req.header("Authorization") ? "Present" : "Missing");
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied",
      code: "NO_TOKEN"
    });
  }
  
  console.log("🔍 [Auth] Token received (first 30 chars):", token.substring(0, 30) + "...");
  console.log("🔍 [Auth] Token source:", req.cookies?.accessToken ? "Cookie" : "Header");
  console.log("🔍 [Auth] JWT Secret available:", config.jwtSecret ? "YES" : "NO");
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    console.log("✅ [Auth] Token verified successfully");
    console.log("✅ [Auth] User ID:", decoded.userId);
    console.log("✅ [Auth] User Type:", decoded.user_type);
    
    // Attach user info to request
    req.user = decoded.userId;
    req.user_id = decoded.userId;
    req.user_type = decoded.user_type;
    req.mobile = decoded.mobile;
    
    next();
  } catch (err) {
    console.error("❌ [Auth] Token verification failed:", err.name);
    console.error("❌ [Auth] Error message:", err.message);
    
    if (err.name === "TokenExpiredError") {
      console.error("❌ [Auth] Token expired at:", new Date(err.expiredAt));
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      console.error("❌ [Auth] JWT Error - Token may be malformed or signed with different secret");
    }
    
    res.status(401).json({ 
      success: false,
      message: "Token is not valid",
      code: "INVALID_TOKEN"
    });
  }
};
