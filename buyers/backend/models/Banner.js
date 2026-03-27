// =====================================================
// models/Banner.js
// Homepage hero sliders, announcement bars.
// =====================================================

const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["hero","announcement","popup","section"], required: true },
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    body:     { type: String, default: "" }, 
    desktopImage: { type: String, default: null },
    mobileImage:  { type: String, default: null }, 
    ctaLabel: { type: String, default: "Shop Now" },
    ctaLink:  { type: String, default: "/shop" },
    bgColor:   { type: String, default: "#c9a96e" },
    textColor: { type: String, default: "#ffffff" },
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },
    isActive:  { type: Boolean, default: true },
    sortOrder: { type: Number,  default: 0 }, 
  },
  { timestamps: true }
);

module.exports = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);