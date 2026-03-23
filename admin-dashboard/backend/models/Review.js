// =====================================================
// models/Review.js
// Customer feedback system.
// =====================================================

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

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
  }
};

module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);