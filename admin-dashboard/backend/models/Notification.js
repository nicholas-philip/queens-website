// =====================================================
// models/Notification.js
// System alerts (e.g. New Order!).
// =====================================================

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
    },
    title: { type: String, default: "" },
    message: { type: String, required: true },
    path: { type: String, default: null }, // Link to specific resource in admin panel
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Clear old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static helper to create a notification quickly
NotificationSchema.statics.push = async function (type, title, message, path = null) {
  try {
    return await this.create({ type, title, message, path });
  } catch (err) {
    console.error("❌ Notification creation failed:", err.message);
  }
};

// Legacy helper (for backward compatibility)
NotificationSchema.statics.notify = async function (type, message) {
  return await this.create({ type, title: type, message });
};

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);