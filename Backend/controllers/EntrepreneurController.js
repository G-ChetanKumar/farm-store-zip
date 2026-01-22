const Entrepreneur = require('../models/EntrepreneurModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Public route - Entrepreneur application submission
exports.applyEntrepreneur = async (req, res) => {
  try {
    const entrepreneur = new Entrepreneur({
      ...req.body,
      approval_status: 'pending',
      status: 'pending',
    });
    await entrepreneur.save();
    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully! We will review and contact you soon.',
      data: entrepreneur 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Admin - Create entrepreneur directly
exports.createEntrepreneur = async (req, res) => {
  try {
    const entrepreneur = new Entrepreneur(req.body);
    await entrepreneur.save();
    res.status(201).json({ success: true, data: entrepreneur });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all entrepreneurs (admin)
exports.getEntrepreneurs = async (req, res) => {
  try {
    const { status, approval_status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (approval_status) filter.approval_status = approval_status;
    
    const entrepreneurs = await Entrepreneur.find(filter)
      .populate('approved_by', 'username')
      .populate('rejected_by', 'username')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: entrepreneurs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get pending entrepreneurs
exports.getPendingEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await Entrepreneur.find({ approval_status: 'pending' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: entrepreneurs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get approved entrepreneurs
exports.getApprovedEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await Entrepreneur.find({ approval_status: 'approved' })
      .populate('approved_by', 'username')
      .sort({ approved_at: -1 });
    res.status(200).json({ success: true, data: entrepreneurs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get rejected entrepreneurs
exports.getRejectedEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await Entrepreneur.find({ approval_status: 'rejected' })
      .populate('rejected_by', 'username')
      .sort({ rejected_at: -1 });
    res.status(200).json({ success: true, data: entrepreneurs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get entrepreneur by ID
exports.getEntrepreneurById = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id)
      .populate('approved_by', 'username')
      .populate('rejected_by', 'username');
    
    if (!entrepreneur) {
      return res.status(404).json({ success: false, message: 'Entrepreneur not found' });
    }
    
    res.status(200).json({ success: true, data: entrepreneur });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update entrepreneur
exports.updateEntrepreneur = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!entrepreneur) {
      return res.status(404).json({ success: false, message: 'Entrepreneur not found' });
    }
    
    res.status(200).json({ success: true, data: entrepreneur });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Approve entrepreneur
exports.approveEntrepreneur = async (req, res) => {
  try {
    const { approval_notes, password } = req.body;
    
    const updateData = {
      approval_status: 'approved',
      status: 'active',
      approved_by: req.admin_id,
      approved_at: new Date(),
      approval_notes: approval_notes,
      rejection_reason: undefined, // Clear any previous rejection
    };
    
    // Set password if provided
    if (password) {
      updateData.password = password;
    }
    
    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!entrepreneur) {
      return res.status(404).json({ success: false, message: 'Entrepreneur not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Entrepreneur approved successfully',
      data: entrepreneur 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reject entrepreneur
exports.rejectEntrepreneur = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }
    
    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      {
        approval_status: 'rejected',
        status: 'rejected',
        rejected_by: req.admin_id,
        rejected_at: new Date(),
        rejection_reason: rejection_reason,
        approved_at: undefined, // Clear any previous approval
        approval_notes: undefined,
      },
      { new: true }
    );
    
    if (!entrepreneur) {
      return res.status(404).json({ success: false, message: 'Entrepreneur not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Entrepreneur rejected',
      data: entrepreneur 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete entrepreneur
exports.deleteEntrepreneur = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByIdAndDelete(req.params.id);
    
    if (!entrepreneur) {
      return res.status(404).json({ success: false, message: 'Entrepreneur not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Entrepreneur deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Entrepreneur login (only approved can login)
exports.loginEntrepreneur = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find entrepreneur by email
    const entrepreneur = await Entrepreneur.findOne({ email });
    
    if (!entrepreneur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entrepreneur not found' 
      });
    }
    
    // Check if approved
    if (entrepreneur.approval_status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your application is still pending approval. Please wait for admin review.' 
      });
    }
    
    // Check if blocked
    if (entrepreneur.status === 'blocked') {
      return res.status(403).json({ 
        success: false, 
        message: entrepreneur.blocked_reason || 'Your account has been blocked.' 
      });
    }
    
    // Verify password
    if (!entrepreneur.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password not set. Please contact admin.' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, entrepreneur.password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: entrepreneur._id, 
        user_type: 'entrepreneur',
        email: entrepreneur.email 
      },
      process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      entrepreneur: {
        id: entrepreneur._id,
        name: entrepreneur.name,
        email: entrepreneur.email,
        phone: entrepreneur.phone,
        user_type: 'entrepreneur',
        status: entrepreneur.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
