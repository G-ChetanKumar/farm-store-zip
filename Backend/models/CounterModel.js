const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  pinCode: {
    type: String,
    required: true,
  },
   counterName: {
    type: String,
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
   address: {
    type: String,
    required: true,
  },
   landMark: {
    type: String,
    required: true,
  },
  location_direction: {
    type: String,
    required: true,
  },
   agentNumber: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Counters", counterSchema);
