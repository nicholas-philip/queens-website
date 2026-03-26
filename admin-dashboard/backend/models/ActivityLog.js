// =====================================================
// models/ActivityLog.js
// Full audit trail — every admin action is recorded here.
// Logs auto-delete after 90 days (TTL index on createdAt).
// =====================================================

const mongoose = require("mongoose");

const ACTIONS = [
  // Auth
  "ADMIN_LOGIN", "ADMIN_LOGOUT", "CHANGED_PASSWORD", "LINKED_FIREBASE",
  // Admin accounts
  "CREATED_ADMIN", "UPDATED_ADMIN", "DEACTIVATED_ADMIN", "DELETED_ADMIN",
  // Products
  "CREATED_PRODUCT", "UPDATED_PRODUCT", "DELETED_PRODUCT",
  "UPDATED_PRODUCT_STATUS", "ADJUSTED_STOCK",
  "ADDED_VARIANT", "UPDATED_VARIANT", "DELETED_VARIANT",
  // Orders
  "UPDATED_ORDER_STATUS", "ADDED_TRACKING", "DELETED_ORDER",
  // Transactions
  "PROCESSED_REFUND",
  // Bulk
  "BULK_UPDATED_ORDERS", "BULK_UPDATED_PRODUCT_STATUS",
  "BULK_DELETED_PRODUCTS", "BULK_RESTOCKED", "BULK_UPDATED_INVOICES",
  // Settings
  "UPDATED_SETTINGS", "MAINTENANCE_MODE_ON", "MAINTENANCE_MODE_OFF",
  // Exports
  "EXPORTED_ORDERS", "EXPORTED_TRANSACTIONS", "EXPORTED_PRODUCTS",
  "EXPORTED_INVOICES", "EXPORTED_CUSTOMERS",
];

const ActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Admin",
      required: true,
      index: true,
    },
    action: {
      type:     String,
      required: true,
      enum:     ACTIONS,
    },
    details: {
      type:    String,
      default: "",
      maxlength: 500,
    },
    ipAddress: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },
    createdAt: {
      type:    Date,
      default: Date.now,
      // TTL: MongoDB auto-deletes logs older than 90 days
      expires: 60 * 60 * 24 * 90,
    },
  }
);

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);