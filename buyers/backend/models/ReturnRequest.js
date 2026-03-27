// =====================================================
// models/ReturnRequest.js
// Customers request returns or exchanges.
// =====================================================

const mongoose = require("mongoose");

const ReturnRequestSchema = new mongoose.Schema(
  {
    orderRef: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    customerName:  { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: { type: String, enum: ["Return", "Exchange"], required: true },
    items: [{
      productName: { type: String, required: true },
      SKU:         { type: String, required: true },
      quantity:    { type: Number, required: true },
      reason:      { type: String, required: true },
    }],
    reason: { type: String, required: true },
    description:  { type: String, default: "" },
    images:       { type: [String], default: [] },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Refunded"], default: "Pending" },
    adminNote:    { type: String, default: "" },
    refundAmount: { type: Number, default: 0 },
    resolvedAt:   { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ReturnRequest || mongoose.model("ReturnRequest", ReturnRequestSchema);