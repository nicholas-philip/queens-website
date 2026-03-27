// =====================================================
// models/SizeGuide.js
// Size and shade guides for products.
// =====================================================

const mongoose = require("mongoose");

const SizeGuideSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    category: { type: String, required: true }, 
    content:  { type: String, required: true },  
    image:    { type: String, default: null },   
    appliesTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tips: [{ type: String }],
    isActive:  { type: Boolean, default: true },
    sortOrder: { type: Number,  default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SizeGuide || mongoose.model("SizeGuide", SizeGuideSchema);