// =====================================================
// models/Coupon.js
// Discount codes logic.
// =====================================================

const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Method to calculate the discount amount
CouponSchema.methods.getDiscountAmount = function (total) {
  if (this.discountType === "percentage") {
    return (this.discountValue / 100) * total;
  }
  return Math.min(this.discountValue, total);
};

// Check if coupon is still valid
CouponSchema.methods.isValid = function () {
  return this.isActive && new Date() <= this.expiryDate;
};

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);