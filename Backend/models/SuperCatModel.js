const mongoose = require("mongoose");

const SuperCategorySchema = new mongoose.Schema(
    {
        fileName: { type: String, required: true },
        imageUrl: { type: String, required: true },
        imagePublicId: { type: String, required: true },
        title: { type: String, required: true },
        enabled: { type: Boolean, default: true }, // Add this line
    },
    { timestamps: true }
);

module.exports = mongoose.model("SuperCategory", SuperCategorySchema);
