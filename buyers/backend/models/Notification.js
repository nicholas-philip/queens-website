// =====================================================
// models/Notification.js
// Admin-side notifications (new orders, new reviews).
// =====================================================

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["NEW_ORDER", "PAYMENT_RECEIVED", "NEW_REVIEW", "OUT_OF_STOCK", "CRM_ALERT", "LOW_STOCK"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    path: { type: String, default: null }, // Link to specific resource in admin panel
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Static helper to create a notification quickly
NotificationSchema.statics.push = async function (type, title, message, path = null) {
  try {
    return await this.create({ type, title, message, path });
  } catch (err) {
    console.error("❌ Notification creation failed:", err.message);
  }
};

// Legacy helper (for backward compatibility / cross-backend alignment)
NotificationSchema.statics.notify = async function (type, message) {
  return await this.create({ type, title: type, message });
};

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
