// =====================================================
// models/FAQ.js
// FAQs organized by category.
// =====================================================

const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    sortOrder: { type: Number, default: 0 }, 
    isActive:  { type: Boolean, default: true },
    viewCount: { type: Number,  default: 0 },   
  },
  { timestamps: true }
);

module.exports = mongoose.models.FAQ || mongoose.model("FAQ", FAQSchema);