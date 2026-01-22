const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    enum: ["Farmer", "Agri-Retailer", "Agent"],
  },
  
  // Source tracking: how user was created
  source: {
    type: String,
    enum: ['self_registered', 'admin_created'],
    default: 'admin_created'
  },
  
  // Additional fields for self-registered users (entrepreneurs)
  gender: { type: String },
  state: { type: String },
  district: { type: String },
  mandal: { type: String },
  cityTownVillage: { type: String },
  
  password: {
    type: String,
  },
  farmestore_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  gstin: { type: String },
  license_number: { type: String },
  license_doc_url: { type: String },
  agent_code: { type: String },
  otp_last_sent_at: { type: Date },
  otp_attempts: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "active", "rejected", "blocked"], default: "pending" },
  rejection_reason: { type: String },
  
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
  blocked_reason: { type: String },
  
  // Preferred counter/store selection
  preferred_counter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counters',
    default: null
  },
  counter_selection_date: { type: Date },
  counter_selection_count: { type: Number, default: 0 },
});

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS)); // Updated here
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.index({ mobile: 1 }, { name: "idx_user_mobile" });
userSchema.index({ email: 1 }, { name: "idx_user_email" });
userSchema.index({ farmestore_id: 1 }, { name: "idx_user_farmestore_id" });
userSchema.index({ user_type: 1 }, { name: "idx_user_user_type" });

module.exports = mongoose.model("User", userSchema);
