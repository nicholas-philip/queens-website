// =====================================================
// models/ShippingZone.js
// Different delivery fees per state or city.
// =====================================================

const mongoose = require("mongoose");

const ShippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    states: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    shippingFee: { type: Number, required: true, min: 0 },
    freeShippingAbove: { type: Number, default: null },
    estimatedDays:   { type: String, default: "3-7 business days" },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

ShippingZoneSchema.methods.calculateFee = function (orderTotal) {
  if (this.freeShippingAbove !== null && orderTotal >= this.freeShippingAbove) return 0;
  return this.shippingFee;
};

module.exports = mongoose.models.ShippingZone || mongoose.model("ShippingZone", ShippingZoneSchema);