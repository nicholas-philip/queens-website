// =====================================================
// models/Review.js
// Customer feedback system.
// Shared between Admin Dashboard and Buyer Storefront.
// =====================================================

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "", lowercase: true, trim: true },
    
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, required: true, trim: true },
    
    isApproved:   { type: Boolean, default: false }, // Moderation required
    adminReply:   { 
      text: { type: String, default: "" },
      repliedAt: { type: Date, default: null }
    },
    ipAddress:    { type: String, default: "" },
  },
  { timestamps: true }
);

// A helper for the admin to quickly recalculate ratings
ReviewSchema.statics.updateProductRating = async function (productId) {
  const Product = mongoose.model("Product");
  const stats = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count
    });
  } else {
    // Reset if no approved reviews left
    await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 });
  }
};

module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);