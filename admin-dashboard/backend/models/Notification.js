// =====================================================
// models/Notification.js
// System alerts (e.g. New Order!).
// =====================================================

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "NEW_ORDER", "LOW_STOCK"
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Clear old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Helper to push a notification quickly from anywhere
NotificationSchema.statics.notify = async function (type, message) {
  return await this.create({ type, message });
};

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);