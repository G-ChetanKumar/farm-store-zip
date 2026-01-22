const mongoose = require("mongoose");

const shippingConfigSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    index: true,
  },
  location_name: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    index: true,
  },
  district: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  delivery_time: {
    type: String,
    default: "3-5 days",
  },
  shipping_fee: {
    type: Number,
    default: 0,
  },
  delivery_mode: {
    type: String,
    enum: ["home_delivery", "store_pickup", "both"],
    default: "home_delivery",
  },
  is_serviceable: {
    type: Boolean,
    default: true,
  },
  is_cod_available: {
    type: Boolean,
    default: true,
  },
  store_type: {
    type: String,
    enum: ["all", "farm_products", "fresh_products", "medicines"],
    default: "all",
  },
  min_order_value: {
    type: Number,
    default: 0,
  },
  free_shipping_above: {
    type: Number,
    default: null,
  },
  estimated_delivery_days: {
    min: { type: Number, default: 3 },
    max: { type: Number, default: 5 },
  },
  notes: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

// Index for fast lookup by pincode
shippingConfigSchema.index({ pincode: 1, is_serviceable: 1 });

module.exports = mongoose.model("ShippingConfig", shippingConfigSchema);
