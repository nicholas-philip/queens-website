// =====================================================
// models/Invoice.js
// Permanent billing record for an order.
// =====================================================

const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  orderRef: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Unpaid" }, // Paid, Unpaid
}, { timestamps: true });

// Auto-generate a professional invoice ID (e.g. INV-2024-0001)
InvoiceSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Invoice").countDocuments();
    const year = new Date().getFullYear();
    this.invoiceId = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);