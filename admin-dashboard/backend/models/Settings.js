// =====================================================
// models/Settings.js
// Global store configuration.
// =====================================================

const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "My Store" },
  storeEmail: { type: String },
  currencySymbol: { type: String, default: "₦" },
  maintenanceMode: { type: Boolean, default: false },
  lowStockThreshold: { type: Number, default: 10 }
}, { timestamps: true });

// Always return the single settings document (or create the first one)
SettingsSchema.statics.load = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);