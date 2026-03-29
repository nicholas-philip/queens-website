// =====================================================
// models/Order.js
// Guest-friendly orders with auto-generated order numbers.
// Full status timeline via statusHistory array.
// =====================================================

const mongoose = require("mongoose");

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const OrderItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  title:      { type: String, required: true },
  SKU:        { type: String, required: true },
  attributes: { type: Object, default: null }, // e.g. { size: "42", color: "Black" }
  price:      { type: Number, required: true, min: 0 },
  quantity:   { type: Number, required: true, min: 1 },
  lineTotal:  { type: Number, required: true, min: 0 },
});

const StatusLogSchema = new mongoose.Schema({
  status:    { type: String, enum: ORDER_STATUSES, required: true },
  note:      { type: String, default: "" },
  changedBy: { type: String, default: "System" },
  changedAt: { type: Date,   default: Date.now },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true }, // auto-generated

    customerDetails: {
      name:  { type: String, required: [true, "Customer name required"], trim: true },
      email: { type: String, default: "", lowercase: true, trim: true },
      phone: { type: String, required: [true, "Phone required"], trim: true },
      address: {
        street:  { type: String, required: true },
        city:    { type: String, required: true },
        state:   { type: String, required: true },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "Ghana" },
      },
    },

    items:         { type: [OrderItemSchema], required: true },

    subtotal:      { type: Number, required: true, min: 0 },
    discount:      { type: Number, default: 0, min: 0 },
    tax:           { type: Number, default: 0, min: 0 },
    shipping:      { type: Number, default: 0, min: 0 },
    total:         { type: Number, required: true, min: 0 },
    currency:      { type: String, default: "GHS" },

    couponCode:     { type: String, default: null, uppercase: true, trim: true },
    trackingNumber: { type: String, default: null },
    carrier:        { type: String, default: null },

    paymentMethod:  { type: String, default: "Card" },
    paymentStatus:  { type: String, enum: ["Unpaid", "Paid", "Refunded"], default: "Unpaid" },
    paystackReference: { type: String, default: null },

    currentStatus: {
      type:    String,
      enum:    ORDER_STATUSES,
      default: "Pending",
      index:   true,
    },
    statusHistory: { type: [StatusLogSchema], default: [] },
    adminNotes:    { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Compound indexes for common admin queries ─────
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customerDetails.phone": 1 });
OrderSchema.index({ "customerDetails.email": 1 });

// ── Collision-safe order number ────────────────────
// countDocuments()+offset is NOT safe when two backends share one DB —
// two simultaneous inserts can compute the same number and one will
// throw a duplicate-key error mid-checkout.
// Instead: prefix QN + yyMMdd + 6 random hex chars → astronomically unique.
OrderSchema.pre("save", function () {
  if (this.isNew && !this.orderNumber) {
    const now  = new Date();
    const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
    this.orderNumber = `#QN-${date}-${rand}`;
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);