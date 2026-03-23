// =====================================================
// models/Coupon.js
// Discount codes logic.
// =====================================================

const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: "" },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  
  minOrderAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: null }, // total times this coupon can be used
  usedCount: { type: Number, default: 0 },
  
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  // Optional: Restrict to certain products or categories
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
}, { timestamps: true });

// Check if coupon is still valid for a specific total
CouponSchema.methods.isValidStatus = function (total = 0) {
  const isExpired = new Date() > this.expiryDate;
  const isInactive = !this.isActive;
  const reachedLimit = this.maxUses !== null && this.usedCount >= this.maxUses;
  const belowMin = total < this.minOrderAmount;

  if (isExpired) return { valid: false, reason: "Coupon has expired." };
  if (isInactive) return { valid: false, reason: "Coupon is no longer active." };
  if (reachedLimit) return { valid: false, reason: "Coupon usage limit reached." };
  if (belowMin) return { valid: false, reason: `Minimum order of ₦${this.minOrderAmount} required.` };

  return { valid: true };
};

// Method to calculate the discount amount
CouponSchema.methods.calculateDiscount = function (total) {
  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (this.discountValue / 100) * total;
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, total); // can't discount more than the total
};

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);