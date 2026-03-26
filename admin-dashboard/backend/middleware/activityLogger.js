// =====================================================
// middleware/activityLogger.js
//
// Writes audit trail entries to the ActivityLog
// collection in MongoDB.
//
// Usage (in any controller):
//   await logActivity(req, "CREATED_PRODUCT", "Product: Luxury Cream")
//
// Falls back silently to console.log if the DB write
// fails so it never crashes the main request.
// =====================================================

const ActivityLog = require("../models/ActivityLog");

const logActivity = async (req, action, details = "") => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) return; // unauthenticated routes — skip

    await ActivityLog.create({
      adminId,
      action,
      details,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });
  } catch (err) {
    // Never crash the main request because of a logging error
    console.error(`⚠️  Activity log failed [${action}]:`, err.message);
  }
};

module.exports = logActivity;
