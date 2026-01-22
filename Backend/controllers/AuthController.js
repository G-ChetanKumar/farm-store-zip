const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Otp = require("../models/OtpModel");
const { sendOtp } = require("../service/msg91-service");
const config = require("../config/db");

const {
  sanitizeString,
  sanitizeMobile,
  isValidMobile,
  isValidUserType,
} = require("../lib/validation");

const OTP_TTL_MINUTES = parseInt(process.env.MSG91_OTP_EXPIRY_MINUTES || "5", 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);
const OTP_RESEND_COOLDOWN_SEC = parseInt(process.env.OTP_RESEND_COOLDOWN_SEC || "30", 10);
const OTP_REQUEST_WINDOW_MINUTES = parseInt(process.env.OTP_REQUEST_WINDOW_MINUTES || "60", 10);
const OTP_REQUEST_MAX = parseInt(process.env.OTP_REQUEST_MAX || "5", 10);
const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || "otp-secret";

const hashOtp = (otp) =>
  crypto.createHmac("sha256", OTP_HASH_SECRET).update(otp).digest("hex");

const generateOtp = (length) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const isRetailerOrAgent = (userType) =>
  userType === "Agri-Retailer" || userType === "Agent";

const sanitizeEmail = (value) => sanitizeString(value).toLowerCase();
const isValidOtp = (value) => {
  const length = parseInt(process.env.MSG91_OTP_LENGTH || "6", 10);
  const regex = new RegExp(`^[0-9]{${length}}$`);
  return regex.test(value);
};

const getFarmestoreId = (userType, mobile) => {
  const last4 = mobile.slice(-4);
  const roleCode = userType === "Farmer" ? "B2C" : userType === "Agri-Retailer" ? "B2B" : "B2A";
  return `FES${roleCode}${last4}`;
};

exports.requestOtp = async (req, res) => {
  try {
    const mobile = sanitizeMobile(req.body.mobile);
    const user_type = sanitizeString(req.body.user_type);
    console.log("[auth.request-otp] start", { mobile, user_type });
    if (!mobile || !user_type) {
      return res.status(400).json({ success: false, message: "mobile and user_type are required" });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number" });
    }
    if (!isValidUserType(user_type)) {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    let user = await User.findOne({ mobile });
    if (user && user.user_type !== user_type) {
      return res.status(400).json({ success: false, message: "User type mismatch" });
    }

    if (!user && user_type !== "Farmer") {
      console.log("[auth.request-otp] blocked non-farmer self-register", { mobile, user_type });
      return res.status(403).json({
        success: false,
        message: "User not registered. Please contact admin.",
      });
    }

    if (!user) {
      user = await User.create({
        mobile,
        user_type,
        status: "pending",
      });
      console.log("[auth.request-otp] created user", { user_id: user._id, status: user.status });
    }

    if (user.status === "rejected") {
      console.log("[auth.request-otp] rejected user", { user_id: user._id });
      return res.status(403).json({
        success: false,
        message: user.rejection_reason || "User registration rejected",
      });
    }
    if (user.status === "blocked") {
      console.log("[auth.request-otp] blocked user", { user_id: user._id });
      return res.status(403).json({
        success: false,
        message: user.blocked_reason || "User access blocked",
      });
    }

    if (user.otp_last_sent_at) {
      const secondsSinceLast = (Date.now() - user.otp_last_sent_at.getTime()) / 1000;
      if (secondsSinceLast < OTP_RESEND_COOLDOWN_SEC) {
        return res.status(429).json({
          success: false,
          message: "OTP resend cooldown active",
          resend_after_sec: Math.ceil(OTP_RESEND_COOLDOWN_SEC - secondsSinceLast),
        });
      }
    }

    const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
    const recentRequests = await Otp.countDocuments({
      user_id: user._id,
      createdAt: { $gte: windowStart },
    });
    if (recentRequests >= OTP_REQUEST_MAX) {
      console.log("[auth.request-otp] rate limit hit", { user_id: user._id, recentRequests });
      return res.status(429).json({
        success: false,
        message: "OTP request limit exceeded",
        retry_after_minutes: OTP_REQUEST_WINDOW_MINUTES,
      });
    }

    const otpLength = parseInt(process.env.MSG91_OTP_LENGTH || "6", 10);
    const otp = generateOtp(otpLength);
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await Otp.updateMany(
      { user_id: user._id, verified: false },
      { verified: true }
    );

    await Otp.create({
      user_id: user._id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    user.otp_last_sent_at = new Date();
    user.otp_attempts = 0;
    await user.save();

    await sendOtp({ mobile, otp });
    console.log("[auth.request-otp] otp sent", { user_id: user._id });

    return res.status(200).json({
      success: true,
      data: { otp_sent: true, resend_after_sec: OTP_RESEND_COOLDOWN_SEC },
    });
  } catch (error) {
    console.error("[auth.request-otp] error", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  return exports.requestOtp(req, res);
};

exports.verifyOtp = async (req, res) => {
  try {
    const mobile = sanitizeMobile(req.body.mobile);
    const otp = sanitizeString(req.body.otp);
    console.log("[auth.verify-otp] start", { mobile });
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: "mobile and otp are required" });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.status === "rejected") {
      console.log("[auth.verify-otp] rejected user", { user_id: user._id });
      return res.status(403).json({
        success: false,
        message: user.rejection_reason || "User registration rejected",
      });
    }
    if (user.status === "blocked") {
      console.log("[auth.verify-otp] blocked user", { user_id: user._id });
      return res.status(403).json({
        success: false,
        message: user.blocked_reason || "User access blocked",
      });
    }

    const otpRecord = await Otp.findOne({ user_id: user._id, verified: false })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    if (otpRecord.expires_at < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: "OTP attempts exceeded" });
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== otpRecord.otp_hash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      console.log("[auth.verify-otp] invalid otp", { user_id: user._id, attempts: otpRecord.attempts });
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    if (user.status !== "active") {
      user.status = "active";
      await user.save();
    }

    // Import security functions
    const {
      generateDeviceFingerprint,
      getDeviceInfo,
      getClientIP,
      generateCSRFToken
    } = require("../middlewares/SecurityMiddleware");

    // Generate access token (30 minutes)
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        user_type: user.user_type,
        mobile: user.mobile
      },
      config.jwtSecret,
      { expiresIn: "30m" }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { 
        userId: user._id, 
        user_type: user.user_type,
        tokenType: "refresh"
      },
      process.env.JWT_REFRESH_SECRET || config.jwtSecret,
      { expiresIn: "7d" }
    );

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Save security info
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.csrfToken = csrfToken;
    user.csrfTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    user.deviceFingerprint = generateDeviceFingerprint(req);
    user.lastLoginIP = getClientIP(req);
    user.lastLoginDevice = getDeviceInfo(req).browser;
    user.lastActivity = new Date();
    user.failedLoginAttempts = 0; // Reset on successful login
    user.accountLockedUntil = null;

    // Log login history
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.push({
      ip: getClientIP(req),
      device: getDeviceInfo(req).browser,
      user_agent: req.headers["user-agent"],
      timestamp: new Date(),
      success: true
    });

    // Keep only last 20 login records
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(-20);
    }

    await user.save();

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log("[auth.verify-otp] login successful", { user_id: user._id, user_type: user.user_type });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      csrfToken: csrfToken, // Frontend stores this
      expiresIn: 1800, // 30 minutes
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          user_type: user.user_type,
          status: user.status,
          farmestore_id: user.farmestore_id,
        },
      },
    });
  } catch (error) {
    console.error("[auth.verify-otp] error", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const mobile = sanitizeMobile(req.body.mobile);
    const name = sanitizeString(req.body.name);
    const email = sanitizeEmail(req.body.email);
    const user_type = sanitizeString(req.body.user_type);
    const gstin = sanitizeString(req.body.gstin);
    const license_number = sanitizeString(req.body.license_number);
    const license_doc_url = sanitizeString(req.body.license_doc_url);
    const agent_code = sanitizeString(req.body.agent_code);

    console.log("[auth.complete-profile] start", { mobile, user_type });
    if (!mobile || !name || !user_type) {
      return res.status(400).json({ success: false, message: "mobile, name, user_type are required" });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number" });
    }
    if (!isValidUserType(user_type)) {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    if (user_type === "Agri-Retailer" && (!gstin || !license_number)) {
      return res.status(400).json({
        success: false,
        message: "gstin and license_number are required for Agri-Retailer",
      });
    }

    if (user_type === "Agent" && !agent_code) {
      return res.status(400).json({
        success: false,
        message: "agent_code is required for Agent",
      });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.user_type !== user_type) {
      return res.status(400).json({ success: false, message: "User type mismatch" });
    }

    const updates = {
      name,
      email,
      gstin,
      license_number,
      license_doc_url,
      agent_code,
      status: isRetailerOrAgent(user_type) ? "pending" : "active",
    };

    if (!user.farmestore_id) {
      updates.farmestore_id = getFarmestoreId(user_type, mobile);
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });

    console.log("[auth.complete-profile] updated", { user_id: updatedUser._id, status: updatedUser.status });

    return res.status(200).json({
      success: true,
      data: {
        farmestore_id: updatedUser.farmestore_id,
        status: updatedUser.status,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          user_type: updatedUser.user_type,
          status: updatedUser.status,
        },
      },
    });
  } catch (error) {
    console.error("[auth.complete-profile] error", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
