// =====================================================
// models/LoyaltyPoint.js
// "GlossyKiss Rewards" loyalty program.
// =====================================================

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  type:    { type: String, enum: ["earn","redeem","bonus","expire","adjust"], required: true },
  points:  { type: Number, required: true }, 
  balance: { type: Number, required: true }, 
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  note:    { type: String, default: "" },
  date:    { type: Date,   default: Date.now },
});

const LoyaltyPointsSchema = new mongoose.Schema(
  {
    phone:     { type: String, required: true, unique: true, trim: true },
    email:     { type: String, default: "",  lowercase: true },
    firstName: { type: String, default: "",  trim: true },
    currentBalance:   { type: Number, default: 0 },   
    totalEarned:      { type: Number, default: 0 },   
    totalRedeemed:    { type: Number, default: 0 },   
    tier:             { type: String, enum: ["Bronze","Silver","Gold","Platinum"], default: "Bronze" },
    transactions: { type: [TransactionSchema], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
    isActive:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

LoyaltyPointsSchema.methods.updateTier = function () {
  const earned = this.totalEarned;
  if      (earned >= 10000) this.tier = "Platinum";
  else if (earned >= 5000)  this.tier = "Gold";
  else if (earned >= 2000)  this.tier = "Silver";
  else                      this.tier = "Bronze";
};

LoyaltyPointsSchema.methods.earnFromOrder = function (orderTotal, orderId) {
  const points = Math.floor(orderTotal / 1000) * 10;
  if (points <= 0) return;
  this.currentBalance   += points;
  this.totalEarned      += points;
  this.lastActivityAt    = new Date();
  this.updateTier();
  this.transactions.push({
    type:    "earn",
    points,
    balance: this.currentBalance,
    orderId,
    note:    `Earned from order GHS ${orderTotal.toLocaleString()}`,
  });
};

LoyaltyPointsSchema.methods.redeemPoints = function (points, orderId) {
  if (points > this.currentBalance) throw new Error("Insufficient points balance.");
  const discount = (points / 100) * 500;
  this.currentBalance -= points;
  this.totalRedeemed  += points;
  this.lastActivityAt  = new Date();
  this.transactions.push({
    type:    "redeem",
    points:  -points,
    balance: this.currentBalance,
    orderId,
    note:    `Redeemed ${points} pts for GHS ${discount.toLocaleString()} discount`,
  });
  return discount;
};

module.exports = mongoose.models.LoyaltyPoints || mongoose.model("LoyaltyPoints", LoyaltyPointsSchema);