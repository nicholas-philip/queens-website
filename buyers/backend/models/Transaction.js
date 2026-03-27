// =====================================================
// models/Transaction.js
// Payment records for both Storefront & Admin.
// =====================================================

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    orderRef:      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

    paymentMethod: {
      type:    String,
      enum:    ["Card", "Bank Transfer", "USSD", "Cash on Delivery", "Wallet", "Mobile Money", "Other"],
      default: "Card",
    },

    amount:   { type: Number, required: true },
    currency: { type: String, default: "GHS" },

    status: {
      type:    String,
      enum:    ["Success", "Failed", "Pending", "Refunded", "Reversed"],
      default: "Pending",
    },

    gatewayResponse: { type: Object, default: null }, // raw data for debugging
    customerName:    { type: String, default: "" },
    customerEmail:   { type: String, default: "" },

    refundReason:    { type: String, default: null },
    refundedAt:      { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
