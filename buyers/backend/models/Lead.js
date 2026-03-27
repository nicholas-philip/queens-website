// =====================================================
// models/Lead.js
//
// Temporary storage for "Lead Capture" during checkout.
// If a customer enters their name/email/phone but 
// abandons the cart, the admin can still reach out.
// =====================================================

const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    
    // Store what was in their cart at the time
    cartItems: { type: Array, default: [] },
    cartTotal: { type: Number, default: 0 },
    
    // Status to track if the lead converted to an order later
    isConverted: { type: Boolean, default: false },
    orderRef:    { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    
    source:      { type: String, default: "Modal_Lead_Capture" },
  },
  { timestamps: true }
);

// Auto-delete leads after 30 days if they haven't converted
LeadSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); 

module.exports = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
