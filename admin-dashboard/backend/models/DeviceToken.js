// =====================================================
// admin-dashboard/backend/models/DeviceToken.js
// Stores FCM registration tokens for push notifications.
// =====================================================

const mongoose = require("mongoose");

const DeviceTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Reference to the customer who owns the device
      default: null,
    },
    platform: {
      type: String,
      enum: ["web", "ios", "android"],
      default: "web",
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.DeviceToken || mongoose.model("DeviceToken", DeviceTokenSchema);
