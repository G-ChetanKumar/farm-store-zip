const crypto = require("crypto");
const Admin = require("../models/AdminModel");

/**
 * Security Middleware Collection
 * 
 * Provides comprehensive security features:
 * - CSRF Protection
 * - Device Fingerprinting
 * - IP Validation
 * - Role-Based Access Control (RBAC)
 * - Permission-Based Access Control
 * - Account Locking
 */

/**
 * Generate Device Fingerprint from User-Agent and other headers
 */
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const acceptLanguage = req.headers["accept-language"] || "";
  const acceptEncoding = req.headers["accept-encoding"] || "";
  
  const fingerprint = crypto
    .createHash("sha256")
    .update(userAgent + acceptLanguage + acceptEncoding)
    .digest("hex");
  
  return fingerprint;
};

/**
 * Get Device Info from User-Agent
 */
const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  
  // Simple parsing (can use ua-parser-js library for more detail)
  let browser = "Unknown";
  let os = "Unknown";
  
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";
  
  return {
    browser,
    os,
    device: userAgent.includes("Mobile") ? "mobile" : "desktop",
    userAgent
  };
};

/**
 * Get Client IP Address
 */
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

/**
 * Generate CSRF Token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Validate CSRF Token Middleware
 */
const validateCSRF = async (req, res, next) => {
  // Skip CSRF for public endpoints
  const publicEndpoints = [
    "/api/admin/admin-login",
    "/api/admin/refresh-token",
    "/api/v1/auth/request-otp",
    "/api/v1/auth/verify-otp"
  ];
  
  if (publicEndpoints.some(endpoint => req.path.includes(endpoint))) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"];
  
  if (!csrfToken) {
    return res.status(403).json({ 
      success: false,
      message: "CSRF token missing",
      code: "CSRF_MISSING"
    });
  }

  try {
    // Get admin ID from JWT (already verified by adminAuth)
    const adminId = req.admin_id;
    const admin = await Admin.findById(adminId);
    
    if (!admin || admin.csrfToken !== csrfToken) {
      return res.status(403).json({ 
        success: false,
        message: "Invalid CSRF token",
        code: "CSRF_INVALID"
      });
    }

    // Check if CSRF token expired
    if (admin.csrfTokenExpiry && admin.csrfTokenExpiry < new Date()) {
      return res.status(403).json({ 
        success: false,
        message: "CSRF token expired",
        code: "CSRF_EXPIRED"
      });
    }

    next();
  } catch (error) {
    console.error("CSRF validation error:", error);
    res.status(500).json({ 
      success: false,
      message: "CSRF validation failed" 
    });
  }
};

/**
 * Validate Device Fingerprint
 * Detects if request is coming from different device (possible token theft)
 */
const validateDevice = async (req, res, next) => {
  try {
    const adminId = req.admin_id;
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    const currentFingerprint = generateDeviceFingerprint(req);
    
    // If fingerprint doesn't match, log suspicious activity
    if (admin.deviceFingerprint && admin.deviceFingerprint !== currentFingerprint) {
      console.warn(`⚠️ Device fingerprint mismatch for admin: ${admin.username}`);
      console.warn(`Stored: ${admin.deviceFingerprint}`);
      console.warn(`Current: ${currentFingerprint}`);
      
      // Log suspicious activity
      if (!admin.loginHistory) admin.loginHistory = [];
      admin.loginHistory.push({
        ip: getClientIP(req),
        device: getDeviceInfo(req).browser,
        timestamp: new Date(),
        success: false
      });
      await admin.save();
      
      return res.status(403).json({ 
        success: false,
        message: "Suspicious activity detected. Device mismatch. Please login again.",
        code: "DEVICE_MISMATCH"
      });
    }

    next();
  } catch (error) {
    console.error("Device validation error:", error);
    next(); // Don't block request on error
  }
};

/**
 * Validate IP Address
 * @param {boolean} strict - If true, blocks request on IP mismatch. If false, just logs.
 */
const validateIP = (strict = false) => {
  return async (req, res, next) => {
    try {
      const adminId = req.admin_id;
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: "Admin not found" 
        });
      }

      const currentIP = getClientIP(req);
      
      if (admin.lastLoginIP && admin.lastLoginIP !== currentIP) {
        console.warn(`⚠️ IP address changed for admin: ${admin.username}`);
        console.warn(`Previous: ${admin.lastLoginIP}, Current: ${currentIP}`);
        
        if (strict) {
          return res.status(403).json({ 
            success: false,
            message: "IP address mismatch. Please login again.",
            code: "IP_MISMATCH"
          });
        }
        
        // Lenient mode - just log and continue
        if (!admin.loginHistory) admin.loginHistory = [];
        admin.loginHistory.push({
          ip: currentIP,
          device: getDeviceInfo(req).browser,
          timestamp: new Date(),
          success: true
        });
        await admin.save();
      }

      next();
    } catch (error) {
      console.error("IP validation error:", error);
      next(); // Don't block request on error
    }
  };
};

/**
 * Check if Account is Locked (for login endpoint)
 */
const checkAccountLock = async (req, res, next) => {
  try {
    const { username } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (admin && admin.accountLockedUntil) {
      if (admin.accountLockedUntil > new Date()) {
        const minutesRemaining = Math.ceil((admin.accountLockedUntil - new Date()) / 60000);
        return res.status(403).json({ 
          success: false,
          message: `Account locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`,
          code: "ACCOUNT_LOCKED",
          minutesRemaining
        });
      } else {
        // Unlock account
        admin.accountLockedUntil = null;
        admin.failedLoginAttempts = 0;
        await admin.save();
      }
    }

    next();
  } catch (error) {
    console.error("Account lock check error:", error);
    next();
  }
};

/**
 * Role-Based Access Control (RBAC)
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const adminId = req.admin_id;
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: "Admin not found" 
        });
      }

      const userRole = admin.role || "admin";

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false,
          message: "Insufficient permissions. This action requires a higher role.",
          code: "FORBIDDEN",
          required_roles: allowedRoles,
          current_role: userRole
        });
      }

      next();
    } catch (error) {
      console.error("RBAC error:", error);
      res.status(500).json({ 
        success: false,
        message: "Permission check failed" 
      });
    }
  };
};

/**
 * Permission-Based Access Control
 * @param {Array<string>} requiredPermissions - Array of permission names required
 */
const requirePermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const adminId = req.admin_id;
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: "Admin not found" 
        });
      }

      // Super admins have all permissions
      if (admin.role === "super_admin") {
        return next();
      }

      const userPermissions = admin.permissions || [];

      const hasPermission = requiredPermissions.every(perm => 
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false,
          message: "Insufficient permissions for this action.",
          code: "FORBIDDEN",
          required_permissions: requiredPermissions,
          current_permissions: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ 
        success: false,
        message: "Permission check failed" 
      });
    }
  };
};

module.exports = {
  generateDeviceFingerprint,
  getDeviceInfo,
  getClientIP,
  generateCSRFToken,
  validateCSRF,
  validateDevice,
  validateIP,
  checkAccountLock,
  requireRole,
  requirePermission
};
