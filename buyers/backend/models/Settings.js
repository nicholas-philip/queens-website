// =====================================================
// models/Settings.js
// Global store settings (fees, thresholds, names).
// Shared between Admin Dashboard and Buyer Storefront.
// =====================================================

const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Queens Fashion Store" },
    storeEmail: { type: String, default: "hello@queens.shop" },
    storePhone: { type: String, default: "+233000000000" },
    storeAddress: { type: String, default: "Accra, Ghana" },
    
    logoUrl: { type: String, default: null },
    storeTagline: { type: String, default: "Professional Beauty" },
    
    currencySymbol: { type: String, default: "GH₵" },
    currencyCode: { type: String, default: "GHS" },
    
    socialLinks: {
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "Store is currently under maintenance." },
    
    allowGuestCheckout: { type: Boolean, default: true },
    
    // Limits
    freeShippingThreshold: { type: Number, default: 500 },
    minimumOrderAmount: { type: Number, default: 50 },

    // Admin specific
    lowStockThreshold: { type: Number, default: 10 }
  },
  { timestamps: true }
);

// Get global settings (singleton style)
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Legacy support for admin's .load()
SettingsSchema.statics.load = async function () {
  return await this.getSettings();
};

module.exports = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
