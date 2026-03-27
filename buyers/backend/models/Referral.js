// =====================================================
// models/Referral.js
// Referral marketing system.
// =====================================================

const mongoose = require("mongoose");
const crypto = require("crypto");

const ReferralSchema = new mongoose.Schema(
  {
    referralCode: { type: String, unique: true, uppercase: true },
    referrerName: { type: String, required: true },
    referrerEmail: { type: String, required: true, unique: true, lowercase: true },
    referrerPhone: { type: String, default: "" },
    
    totalReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    totalRewardsEarned: { type: Number, default: 0 },
    
    referredCustomers: [{
      name: { type: String },
      email: { type: String },
      orderNumber: { type: String },
      date: { type: Date, default: Date.now },
    }],
    
    rewardCoupons: [{
      code: { type: String },
      amount: { type: Number },
      isUsed: { type: Boolean, default: false },
    }],
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate referral code
ReferralSchema.pre("save", function (next) {
  if (this.isNew && !this.referralCode) {
    const part = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.referralCode = `GK-${part}`;
  }
  next();
});

module.exports = mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);
