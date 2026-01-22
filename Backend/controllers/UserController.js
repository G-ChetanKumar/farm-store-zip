const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/db");
const {
  sanitizeString,
  sanitizeMobile,
  isValidMobile,
  isValidEmail,
  isValidUserType,
} = require("../lib/validation");

exports.createUser = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const mobile = sanitizeMobile(req.body.mobile);
    const user_type = sanitizeString(req.body.user_type);
    const password = sanitizeString(req.body.password);
    const status = sanitizeString(req.body.status);
    
    // Extract entrepreneur-specific fields if provided
    const gender = req.body.gender ? sanitizeString(req.body.gender) : undefined;
    const state = req.body.state ? sanitizeString(req.body.state) : undefined;
    const district = req.body.district ? sanitizeString(req.body.district) : undefined;
    const mandal = req.body.mandal ? sanitizeString(req.body.mandal) : undefined;
    const cityTownVillage = req.body.cityTownVillage ? sanitizeString(req.body.cityTownVillage) : undefined;
    
    if (!name || !mobile || !user_type) {
      return res.status(400).json({ message: "name, mobile, user_type are required" });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }
    if (!isValidUserType(user_type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (user_type && user_type !== "Farmer" && req.user_type !== "admin") {
      return res.status(403).json({ message: "Only admins can register this user type" });
    }
    
    // Determine source
    const source = req.user_type === "admin" ? 'admin_created' : 'self_registered';
    
    const user = new User({ 
      name, 
      email, 
      mobile, 
      user_type, 
      password, 
      status,
      source,
      gender,
      state,
      district,
      mandal,
      cityTownVillage
    });
    await user.save();
    res.status(200).json({ message: "success", data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { user_type, source, approval_status, status } = req.query;
    const filter = {};
    
    if (user_type) filter.user_type = user_type;
    if (source) filter.source = source;
    if (approval_status) filter.approval_status = approval_status;
    if (status) filter.status = status;
    
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, mobile, user_type, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, user_type, status },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const user = await User.findByIdAndUpdate(
      req.user,
      { name, email },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  const password = sanitizeString(req.body.password);
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ message: user.blocked_reason || "User access blocked" });
    }

    // Generate tokens (matching OTP login flow)
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
        mobile: user.mobile,
        email: user.email
      },
      config.jwtSecret,
      { expiresIn: "30m" }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { 
        userId: user._id,
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
    user.failedLoginAttempts = 0;
    
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

    console.log("[user.login] Login successful", { user_id: user._id, user_type: user.user_type });

    res.status(200).json({
      success: true,
      message: "Login successful",
      csrfToken: csrfToken,
      expiresIn: 1800, // 30 minutes
      token: accessToken, // For backward compatibility
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("[user.login] Login error:", error);
    res.status(500).json({ error: error.message });
  }

  // Reset paswsword logic can be added here
  exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

exports.getUserStats = async (req, res) => {
  try {
    const Order = require("../models/OrderModel");
    const Cart = require("../models/CartModel");
    const Address = require("../models/AddressModel");
    const KisanCashTransaction = require("../models/KisanCashTransactionModel");

    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalOrders = await Order.countDocuments({ user_id: userId });
    const pendingOrders = await Order.countDocuments({ user_id: userId, order_status: "pending" });
    const deliveredOrders = await Order.countDocuments({ user_id: userId, order_status: "delivered" });

    const orderAggregation = await Order.aggregate([
      { $match: { user_id: new require("mongoose").Types.ObjectId(userId) } },
      { $group: { _id: null, totalSpent: { $sum: "$total_amount" } } }
    ]);
    const totalSpent = orderAggregation.length > 0 ? orderAggregation[0].totalSpent : 0;

    const cart = await Cart.findOne({ user_id: userId });
    const cartItemCount = cart ? cart.items.length : 0;

    const addressCount = await Address.countDocuments({ user_id: userId });

    const kisanCashBalance = await KisanCashTransaction.aggregate([
      { $match: { user_id: new require("mongoose").Types.ObjectId(userId) } },
      { $group: { _id: null, balance: { $sum: "$amount" } } }
    ]);
    const balance = kisanCashBalance.length > 0 ? kisanCashBalance[0].balance : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          user_type: user.user_type,
          farmestore_id: user.farmestore_id,
          status: user.status,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          totalSpent: totalSpent,
        },
        cart: {
          itemCount: cartItemCount,
        },
        addresses: {
          count: addressCount,
        },
        kisanCash: {
          balance: balance,
        },
      },
    });
  } catch (error) {
    console.error("[getUserStats] error", error.message);
    res.status(500).json({ error: error.message });
  }
};
