const mongoose = require("mongoose");

const PestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sub_title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
    required: true,
  },
  affectedCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  }],
});

module.exports = mongoose.model("Pest", PestSchema);
