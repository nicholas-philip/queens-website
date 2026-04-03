// =====================================================
// models/Order.js
// Buyer Store Order Schema.
// =====================================================

const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  title:      { type: String, required: true },
  SKU:        { type: String, required: true },
  attributes: { type: Object, default: null }, 
  price:      { type: Number, required: true, min: 0 },
  quantity:   { type: Number, required: true, min: 1 },
  lineTotal:  { type: Number, required: true, min: 0 },
});

const StatusLogSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String, default: "" },
  changedAt: { type: Date,   default: Date.now },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true }, 

    customerDetails: {
      name:  { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, required: true },
      address: {
        street:  { type: String, required: true },
        city:    { type: String, required: true },
        state:   { type: String, required: true },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "Ghana" },
      },
    },

    items: { type: [OrderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax:      { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total:    { type: Number, required: true },
    currency: { type: String, default: "GHS" },

    couponCode:          { type: String, default: null },
    trackingNumber:      { type: String, default: null },
    carrier:             { type: String, default: null },
    paymentMethod:       { type: String, default: "Card" },
    paymentStatus:       { type: String, enum: ["Unpaid", "Paid", "Refunded"], default: "Unpaid" },
    paystackReference:   { type: String, default: null },

    currentStatus: { type: String, default: "Pending" },
    statusHistory: { type: [StatusLogSchema], default: [] },
    adminNotes:    { type: String, default: "" },
    metadata: {
      sessionId:   { type: String, default: null, index: true },
      userAgent:   { type: String, default: null },
      ipAddress:   { type: String, default: null },
    },
  },
  { timestamps: true }
);

// ── Collision-safe order number ────────────────────
// countDocuments()+offset is NOT safe when two backends share one DB —
// two simultaneous inserts can compute the same number and one will
// throw a duplicate-key error mid-checkout.
// Instead: prefix QN + yyMMdd + 6 random hex chars → astronomically unique.
OrderSchema.pre("save", function () {
  if (this.isNew && !this.orderNumber) {
    const now  = new Date();
    const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    this.orderNumber = `QN-${date}-${rand}`;
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
