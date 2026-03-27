// =====================================================
// models/GiftCard.js
// Digital gift cards customers can buy and send.
// =====================================================

const mongoose = require("mongoose");
const crypto   = require("crypto");

const GiftCardSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true },
    initialBalance: { type: Number, required: true, min: 500 },
    balance: { type: Number, required: true },
    purchaserEmail: { type: String, required: true, lowercase: true },
    purchaserName:  { type: String, required: true },
    recipientEmail: { type: String, required: true, lowercase: true },
    recipientName:  { type: String, required: true },
    personalMessage:{ type: String, default: "" },
    isSent:     { type: Boolean, default: false },
    sentAt:     { type: Date,    default: null },
    expiryDate: { type: Date, required: true },
    isActive:   { type: Boolean, default: true },
    usageHistory: [{
      orderId:   { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      amountUsed:{ type: Number },
      usedAt:    { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

GiftCardSchema.pre("save", function (next) {
  if (this.isNew && !this.code) {
    const part = () => crypto.randomBytes(2).toString("hex").toUpperCase();
    this.code    = `GLOSS-${part()}-${part()}`;
    this.balance = this.initialBalance;
  }
  next();
});

module.exports = mongoose.models.GiftCard || mongoose.model("GiftCard", GiftCardSchema);