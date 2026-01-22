const jwt = require("jsonwebtoken");

/**
 * Admin Authentication Middleware
 * 
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
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied",
      code: "NO_TOKEN"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    
    // Attach admin info to request
    req.admin_id = decoded.userId || decoded.id; // Support both field names
    req.user_id = decoded.userId || decoded.id;
    req.user_type = decoded.user_type;
    req.user_role = decoded.role;
    req.user_permissions = decoded.permissions;
    
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Token is not valid",
      code: "INVALID_TOKEN"
    });
  }
};
