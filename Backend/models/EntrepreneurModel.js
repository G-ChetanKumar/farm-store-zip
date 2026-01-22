const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EntrepreneurSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String }, // For login after approval
  
  // User type choice - entrepreneur applies as Agent or Agri-Retailer
  user_type: {
    type: String,
    enum: ['Agent', 'Agri-Retailer'],
    required: true,
    default: 'Agent'
  },
  
  // Location details (collected during self-registration)
  state: { type: String, required: true },
  district: { type: String, required: true },
  mandal: { type: String, required: true },
  cityTownVillage: { type: String, required: true },
  
  // Approval workflow fields
  approval_status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'blocked'], 
    default: 'pending' 
  },
  
  // Approval/Rejection metadata
  approved_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  approved_at: { type: Date },
  rejected_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  rejected_at: { type: Date },
  rejection_reason: { type: String },
  approval_notes: { type: String },
  
  // Additional fields
  comments: { type: String },
  blocked_reason: { type: String },
}, { timestamps: true });

// Hash password before saving
EntrepreneurSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Entrepreneur', EntrepreneurSchema);
