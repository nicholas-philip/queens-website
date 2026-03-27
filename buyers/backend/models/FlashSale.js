// =====================================================
// models/FlashSale.js
// Time-limited flash sales that override product prices.
// =====================================================

const mongoose = require("mongoose");

const FlashSaleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true }, 
    description: { type: String, default: "" },
    bannerImage: { type: String, default: null },
    discountType:  { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    products:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FlashSaleSchema.virtual("isLive").get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

FlashSaleSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.models.FlashSale || mongoose.model("FlashSale", FlashSaleSchema);