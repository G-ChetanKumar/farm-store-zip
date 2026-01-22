const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: ["super_admin", "admin", "moderator"],
    default: "admin"
  },
  permissions: [{
    type: String,
    enum: ["create", "read", "update", "delete", "approve", "manage_users", "view_analytics", "manage_settings"]
  }],
  
  // Security fields for token management
  refreshToken: { type: String, default: null },
  refreshTokenExpiry: { type: Date, default: null },
  csrfToken: { type: String, default: null },
  csrfTokenExpiry: { type: Date, default: null },
  lastActivity: { type: Date, default: Date.now },
  
  // Device and IP tracking
  deviceFingerprint: { type: String },
  lastLoginIP: { type: String },
  lastLoginDevice: { type: String },
  
  // Login history and security
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: { type: Date, default: Date.now },
    success: Boolean,
    user_agent: String
  }],
  
  // Failed login attempts and account locking
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  
  // Two-factor authentication (optional for future)
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }
});

// adminSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS)); // Updated here
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

module.exports = mongoose.model("Admin", adminSchema);
