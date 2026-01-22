const Admin = require("../models/AdminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");

exports.registerAdmin = async (req, res) => {
  const username = sanitizeString(req.body.username);
  const password = sanitizeString(req.body.password);
  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }
  const existingUser = await Admin.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new Admin({ username, password: hashedPassword });
  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
};

//wow

exports.loginAdmin = async (req, res) => {
  const {
    generateDeviceFingerprint,
    getDeviceInfo,
    getClientIP,
    generateCSRFToken
  } = require("../middlewares/SecurityMiddleware");

  const username = sanitizeString(req.body.username);
  const password = sanitizeString(req.body.password);
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "username and password are required" 
    });
  }
  
  const user = await Admin.findOne({ username });
  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid credentials" 
    });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Track failed login attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    
    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();
      
      return res.status(403).json({ 
        success: false,
        message: "Account locked due to multiple failed attempts. Try again in 15 minutes.",
        code: "ACCOUNT_LOCKED",
        lockedUntil: user.accountLockedUntil
      });
    }
    
    await user.save();
    return res.status(400).json({ 
      success: false,
      message: "Invalid credentials",
      attemptsRemaining: 5 - user.failedLoginAttempts
    });
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;

  // Generate access token (short-lived - 30 minutes)
  const accessToken = jwt.sign(
    { 
      userId: user._id,
      user_type: "admin",
      role: user.role || "admin",
      permissions: user.permissions || []
    }, 
    process.env.ADMIN_JWT_SECRET, 
    {
      expiresIn: "30m", // 30 minutes
    }
  );

  // Generate refresh token (long-lived - 7 days)
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      user_type: "admin",
      tokenType: "refresh"
    }, 
    process.env.ADMIN_REFRESH_SECRET || process.env.ADMIN_JWT_SECRET, 
    {
      expiresIn: "7d", // 7 days
    }
  );

  // Generate CSRF token
  const csrfToken = generateCSRFToken();
  
  // Save security info
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  user.csrfToken = csrfToken;
  user.csrfTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  user.deviceFingerprint = generateDeviceFingerprint(req);
  user.lastLoginIP = getClientIP(req);
  user.lastLoginDevice = getDeviceInfo(req).browser;
  user.lastActivity = new Date();
  
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
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 60 * 1000 // 30 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Send CSRF token in response (NOT in cookie)
  res.json({ 
    success: true,
    message: "Login successful",
    csrfToken: csrfToken, // Frontend stores this and sends in headers
    expiresIn: 1800, // 30 minutes in seconds
    admin: {
      id: user._id,
      username: user.username,
      role: user.role || "admin",
      permissions: user.permissions || [],
      user_type: "admin"
    }
  });
};

exports.updateAdmin = async (req, res) => {
  try {
    const username = sanitizeString(req.body.username);
    const password = sanitizeString(req.body.password);
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (username) {
      const existingUser = await Admin.findOne({ username });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Username already taken" });
      }
      admin.username = username;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }
    await admin.save();
    res.json({ message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByIdAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById("6716a96020db59597f94e398");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Admin" });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "pending" });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const filters = {};
    const status = sanitizeString(req.query.status);
    const user_type = sanitizeString(req.query.user_type);
    const mobile = sanitizeMobile(req.query.mobile);
    const search = sanitizeString(req.query.search);

    if (status) {
      const allowedStatus = new Set(["pending", "active", "rejected", "blocked"]);
      if (!allowedStatus.has(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      filters.status = status;
    }
    if (user_type && isValidUserType(user_type)) {
      filters.user_type = user_type;
    }
    if (mobile) {
      filters.mobile = mobile;
    }
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filters);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserCartAndPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const cart = await Cart.findOne({ user_id: id });
    const lastOrder = await Order.findOne({ user_id: id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: {
        user,
        cart: cart || { user_id: id, items: [] },
        last_payment_status: lastOrder ? lastOrder.razorpay_payment_status : null,
        last_order_id: lastOrder ? lastOrder._id : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkUserCart = async (req, res) => {
  try {
    const Product = require("../models/ProductModel");
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ user_id: id });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({ 
        success: true, 
        valid: true,
        data: { 
          user_id: id,
          user_name: user.name,
          user_type: user.user_type,
          items: [] 
        },
        issues: []
      });
    }

    const issues = [];
    const validItems = [];

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      
      try {
        const product = await Product.findById(item.product_id);
        
        if (!product) {
          issues.push({
            index: i,
            product_id: item.product_id,
            issue: "product_not_found",
            message: "Product no longer exists"
          });
          continue;
        }

        const totalStock = typeof product.total_stock === "number" ? product.total_stock : 0;
        if (totalStock <= 0) {
          issues.push({
            index: i,
            product_id: item.product_id,
            product_title: product.title,
            issue: "out_of_stock",
            message: "Product is out of stock"
          });
          continue;
        }

        if (item.qty > totalStock) {
          issues.push({
            index: i,
            product_id: item.product_id,
            product_title: product.title,
            issue: "insufficient_stock",
            message: `Only ${totalStock} items available`,
            available_qty: totalStock,
            requested_qty: item.qty
          });
        }

        let variantFound = false;
        let currentPrice = null;
        
        if (item.variant_id && product.package_qty) {
          const variant = product.package_qty.find(v => v._id && v._id.toString() === item.variant_id);
          if (variant) {
            variantFound = true;
            currentPrice = Number(variant.sell_price);
            
            if (currentPrice !== item.unit_price) {
              issues.push({
                index: i,
                product_id: item.product_id,
                product_title: product.title,
                variant_id: item.variant_id,
                issue: "price_changed",
                message: "Price has changed",
                old_price: item.unit_price,
                new_price: currentPrice
              });
            }
          }
        }

        if (item.variant_id && !variantFound) {
          issues.push({
            index: i,
            product_id: item.product_id,
            product_title: product.title,
            variant_id: item.variant_id,
            issue: "variant_not_found",
            message: "Product variant no longer available"
          });
          continue;
        }

        validItems.push({
          ...item.toObject ? item.toObject() : item,
          product_title: product.title,
          product_sub_title: product.sub_title,
          current_stock: totalStock,
          current_price: currentPrice || item.unit_price
        });
      } catch (err) {
        issues.push({
          index: i,
          product_id: item.product_id,
          issue: "validation_error",
          message: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      valid: issues.length === 0,
      data: {
        user_id: id,
        user_name: user.name,
        user_type: user.user_type,
        items: validItems,
        total_items: validItems.length
      },
      issues: issues,
      has_issues: issues.length > 0,
      summary: {
        total_cart_items: cart.items.length,
        valid_items: validItems.length,
        items_with_issues: issues.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { status: "active", rejection_reason: undefined },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = sanitizeString(req.body.reason);
    const user = await User.findByIdAndUpdate(
      id,
      { status: "rejected", rejection_reason: reason || "Rejected by admin" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = sanitizeString(req.body.reason);
    const user = await User.findByIdAndUpdate(
      id,
      { status: "blocked", blocked_reason: reason || "Blocked by admin" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { status: "active", blocked_reason: undefined },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sanitizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeMobile = (value) => sanitizeString(value).replace(/[^0-9]/g, "");

const isValidUserType = (value) => ["Farmer", "Agri-Retailer", "Agent"].includes(value);

exports.createUserByAdmin = async (req, res) => {
  try {
    const mobile = sanitizeMobile(req.body.mobile);
    const user_type = sanitizeString(req.body.user_type);
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const gstin = sanitizeString(req.body.gstin);
    const license_number = sanitizeString(req.body.license_number);
    const license_doc_url = sanitizeString(req.body.license_doc_url);
    const agent_code = sanitizeString(req.body.agent_code);
    const status = sanitizeString(req.body.status) || "active";

    if (!mobile || !user_type) {
      return res.status(400).json({ success: false, message: "mobile and user_type are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const allowedStatus = new Set(["pending", "active", "rejected", "blocked"]);
    if (status && !allowedStatus.has(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    if (!isValidUserType(user_type)) {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      mobile,
      user_type,
      name,
      email,
      gstin,
      license_number,
      license_doc_url,
      agent_code,
      status,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
