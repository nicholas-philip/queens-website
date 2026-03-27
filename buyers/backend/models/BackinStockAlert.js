// =====================================================
// models/BackInStockAlert.js
// Customers leave their email on a sold-out product.
// =====================================================

const mongoose = require("mongoose");

const BackInStockAlertSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    email: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    notified:   { type: Boolean, default: false },
    notifiedAt: { type: Date,    default: null },
  },
  { timestamps: true }
);

BackInStockAlertSchema.index({ productId: 1, email: 1 }, { unique: true });

module.exports = mongoose.models.BackInStockAlert || mongoose.model("BackInStockAlert", BackInStockAlertSchema);