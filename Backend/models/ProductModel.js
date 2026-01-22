const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: [
      {
        fileName: { type: String, required: true },
        imageUrl: { type: String, required: true },
        imagePublicId: { type: String, required: true },
        sequence: { type: Number, required: true },
      }
    ],
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
    sub_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategories",
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    crop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    pest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pest",
      required: true, // Not all products must be linked to a pest
    },
    title: { type: String, required: true },
    sub_title: { type: String, required: true },
    description: { type: String, required: true },
    chemical_content: { type: String },
    technical_name: { type: String },
    mode_of_action: { type: String },
    product_form: { type: String },
    packaging: { type: String },
    formulation: { type: String },
    usage_method: { type: String },
    features_benefits: { type: String },
    modes_of_use: { type: String },
    method_of_application: { type: String },
    recommendations: { type: String },
    mfg_by: { type: String },
    agent_commission: { type: String },
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    delivery_speed: {
      type: String,
      enum: ["30-45 min", "same day", "tomorrow", "within 3 days", "within 1 week"],
    },
    package_qty: [
      {
        pkgName: { type: String },
        qty: { type: String },
        mrp_price: { type: String },
        sell_price: { type: String },
        mfg_date: { type: String },
        exp_date: { type: String },
        stock_qty: { type: Number, default: 0 },
      },
    ],
    retailer_package_qty: [
      {
        pkgName: { type: String },
        qty: { type: String },
        mrp_price: { type: String },
        sell_price: { type: String },
        mfg_date: { type: String },
        exp_date: { type: String },
        stock_qty: { type: Number, default: 0 },
      },
    ],
    total_stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
