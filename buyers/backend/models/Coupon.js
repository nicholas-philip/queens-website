// =====================================================
// models/Coupon.js
// Vouchers and promotional codes.
// =====================================================

const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    
    // Limits
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // restricted to these
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // restricted to these
  },
  { timestamps: true }
);

// Check if a coupon is valid for an order sum
CouponSchema.methods.isValid = function (orderSum) {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: "Coupon is inactive." };
  if (now > this.expiryDate) return { valid: false, reason: "Coupon has expired." };
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return { valid: false, reason: "Coupon usage limit reached." };
  if (orderSum < this.minOrderAmount) return { valid: false, reason: `Minimum spend is GHS ${this.minOrderAmount.toLocaleString()}.` };
  return { valid: true };
};

// Calculate discount amount
CouponSchema.methods.calculateDiscount = function (orderSum) {
  if (this.discountType === "percentage") {
    return (orderSum * (this.discountValue / 100));
  }
  return this.discountValue; // Fixed amount
};

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
