const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  super_cat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperCategory",
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
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
});

module.exports = mongoose.model("SubCategories", subcategorySchema);
