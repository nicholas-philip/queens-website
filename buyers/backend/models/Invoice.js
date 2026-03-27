// =====================================================
// models/Invoice.js
// Permanent billing record for an order.
// Shared between Admin Dashboard and Buyer Storefront.
// =====================================================

const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true }, // Unified field for invoice number
    orderRef:      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    
    customerName:  { type: String, required: true },
    customerEmail: { type: String, default: "" },
    
    items: [{
      title:     { type: String },
      SKU:       { type: String },
      quantity:  { type: Number },
      price:     { type: Number },
      lineTotal: { type: Number },
    }],
    
    subtotal:        { type: Number, required: true },
    discount:        { type: Number, default: 0 },
    tax:             { type: Number, default: 0 },
    shippingCharge:  { type: Number, default: 0 },
    amount:          { type: Number, required: true },
    
    couponCode:    { type: String, default: null, uppercase: true },
    status:        { type: String, enum: ["Paid", "Unpaid", "Cancelled", "Overdue"], default: "Unpaid" },
    paymentMethod: { type: String, default: "Card" },
    paidAt:        { type: Date,   default: null },
  },
  { timestamps: true }
);

// Auto-generate professional invoice ID
InvoiceSchema.pre("save", async function () {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${1001 + count}`;
  }
});

module.exports = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
