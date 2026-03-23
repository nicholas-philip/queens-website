// =====================================================
// models/ActivityLog.js
// Pro Feature: Audit trail for all changes.
// =====================================================

const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ["CREATED_PRODUCT", "UPDATED_PRODUCT", "DELETED_PRODUCT", 
           "ORDER_STATUS_CHANGED", "REFUND_PROCESSED", "ADMIN_LOGIN",
           "UPDATE_SETTINGS", "PAGE_UPDATE", "COUPON_CREATED"]
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "90d" // Automatic cleanup: logs delete after 90 days to keep DB fast
  }
});

module.exports = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);