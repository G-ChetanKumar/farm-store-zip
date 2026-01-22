const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    super_cat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperCategory",
      required: true,
    },
    fileName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    title: { type: String, required: true },
    // sub_title: { type: String, required: true },
    // description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
