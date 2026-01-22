const jwt = require("jsonwebtoken");
const config = require("../config/db");

/**
 * Optional Authentication Middleware
 * 
 * Adds user info to request if token is valid, but doesn't reject if missing.
 * Useful for endpoints that work for both guests and authenticated users.
 * 
 * Use Cases:
 * - Testing endpoints during development
 * - Public endpoints that show extra features for logged-in users
 * - Gradual authentication (user can browse as guest, auth required only for actions)
 * 
 * Usage:
 * const optionalAuth = require("../middlewares/OptionalAuth");
 * router.post("/some-endpoint", optionalAuth, controller.someMethod);
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

  // If no token, continue without auth (guest mode)
  if (!token) {
    console.log("ℹ️ [OptionalAuth] No token provided - continuing as guest");
    req.isAuthenticated = false;
    return next();
  }
  
  console.log("🔍 [OptionalAuth] Token found, attempting verification");
  console.log("🔍 [OptionalAuth] Token source:", req.cookies?.accessToken ? "Cookie" : "Header");
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    console.log("✅ [OptionalAuth] Token verified successfully");
    console.log("✅ [OptionalAuth] User ID:", decoded.userId);
    console.log("✅ [OptionalAuth] User Type:", decoded.user_type);
    
    // Attach user info to request
    req.user = decoded.userId;
    req.user_id = decoded.userId;
    req.user_type = decoded.user_type;
    req.mobile = decoded.mobile;
    req.isAuthenticated = true;
    
    next();
  } catch (err) {
    console.log("⚠️ [OptionalAuth] Token verification failed:", err.name);
    console.log("⚠️ [OptionalAuth] Continuing as guest");
    
    // Token is invalid, but we continue anyway (as guest)
    req.isAuthenticated = false;
    next();
  }
};
