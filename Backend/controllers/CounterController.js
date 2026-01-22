const Counter = require("../models/CounterModel");

// Create Counter
exports.createCrop = async (req, res) => {
  try {
    const {
      pinCode,
      counterName,
      agentName,
      address,
      landMark,
      location_direction,
      agentNumber,
    } = req.body;

    if (
      !pinCode ||
      !counterName ||
      !agentName ||
      !address ||
      !landMark ||
      !location_direction ||
      !agentNumber
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const counter = new Counter({
      pinCode,
      counterName,
      agentName,
      address,
      landMark,
      location_direction,
      agentNumber,
    });

    await counter.save();
    res.status(201).json({ message: "Counter created successfully!", counter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Counters
exports.getAllCrops = async (req, res) => {
  try {
    const counters = await Counter.find();
    res.status(200).json(counters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching counters" });
  }
};

// Get Counter by ID
exports.getByIdCrops = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      return res.status(404).json({ message: "Counter not found" });
    }
    res.json(counter); // Return the full counter object
  } catch (error) {
    res.status(500).json({ message: "Error fetching counter", error });
  }
};

// Update Counter
exports.updateCrop = async (req, res) => {
  try {
    console.log('Update Counter Request - ID:', req.params.id);
    console.log('Update Counter Request - Body:', req.body);

    const {
      pinCode,
      counterName,
      agentName,
      address,
      landMark,
      location_direction,
      agentNumber,
    } = req.body;

    // Validate required fields
    if (!pinCode || !counterName || !agentName || !address || !landMark || !location_direction || !agentNumber) {
      return res.status(400).json({ 
        message: "All fields are required",
        missing: {
          pinCode: !pinCode,
          counterName: !counterName,
          agentName: !agentName,
          address: !address,
          landMark: !landMark,
          location_direction: !location_direction,
          agentNumber: !agentNumber
        }
      });
    }

    const updateData = {
      pinCode,
      counterName,
      agentName,
      address,
      landMark,
      location_direction,
      agentNumber,
    };

    const counter = await Counter.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!counter) {
      return res.status(404).json({ message: "Counter not found" });
    }

    console.log('Counter updated successfully:', counter);
    res.status(200).json(counter);
  } catch (error) {
    console.error('Update Counter Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Counter
exports.deleteCrop = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter) return res.status(404).json({ message: "Counter not found" });

    await Counter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Counter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
