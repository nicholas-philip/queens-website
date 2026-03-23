// =====================================================
// models/Transaction.js
// One record per payment attempt (success or fail).
// One order can have multiple transactions.
// =====================================================

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: [true, "Transaction ID required"], unique: true },
    orderRef:      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

    paymentMethod: {
      type:    String,
      enum:    ["Card","Bank Transfer","USSD","Cash on Delivery","Wallet","Other"],
      default: "Card",
    },

    isMember: { type: Boolean, default: false },
    amount:   { type: Number, required: [true, "Amount required"], min: 0 },

    status: {
      type:    String,
      enum:    ["Success","Failed","Pending","Refunded"],
      default: "Pending",
    },

    gatewayResponse: { type: Object, default: null }, // raw gateway payload for debugging
    refundReason:    { type: String, default: null },
    refundedAt:      { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);