// =====================================================
// models/Order.js
// Orders placed by customers (guest-friendly).
// Auto-generates order numbers: #GK-1001, #GK-1002...
// Full status timeline via statusHistory array.
// =====================================================

const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  title:      { type: String, required: true },
  SKU:        { type: String, required: true },
  attributes: { type: Object, default: null }, // e.g. { size: "42", color: "Black" }
  price:      { type: Number, required: true },
  quantity:   { type: Number, required: true, min: 1 },
  lineTotal:  { type: Number, required: true },
});

const StatusLogSchema = new mongoose.Schema({
  status:    { type: String, enum: ["Pending","Processing","Shipped","Delivered","Cancelled"], required: true },
  note:      { type: String, default: "" },
  changedAt: { type: Date,   default: Date.now },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // auto-generated

    customerDetails: {
      name:  { type: String, required: [true, "Customer name required"] },
      email: { type: String, default: "" },
      phone: { type: String, required: [true, "Phone required"] },
      address: {
        street:  { type: String, required: true },
        city:    { type: String, required: true },
        state:   { type: String, required: true },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "Nigeria" },
      },
    },

    items: { type: [OrderItemSchema], required: true },

    subtotal:  { type: Number, required: true },
    discount:  { type: Number, default: 0 },
    tax:       { type: Number, default: 0 },
    shipping:  { type: Number, default: 0 },
    total:     { type: Number, required: true },

    couponCode:     { type: String, default: null },
    trackingNumber: { type: String, default: null },

    currentStatus: {
      type:    String,
      enum:    ["Pending","Processing","Shipped","Delivered","Cancelled"],
      default: "Pending",
    },
    statusHistory: { type: [StatusLogSchema], default: [] },
    adminNotes:    { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function () {
  if (this.isNew) {
    const count      = await mongoose.model("Order").countDocuments();
    this.orderNumber = `#GK-${1001 + count}`;
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);