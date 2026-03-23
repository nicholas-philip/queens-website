// =====================================================
// middleware/verifyAdmin.js
//
// Protects all admin routes.
// Supports TWO authentication methods in one middleware:
//
//   METHOD 1 — Express JWT (your own login system)
//     Frontend sends: Authorization: Bearer <jwt_token>
//     - jwt_token was returned from POST /api/auth/login
//     - We verify it with jwt.verify()
//
//   METHOD 2 — Firebase Auth Token
//     Frontend sends: Authorization: Bearer <firebase_id_token>
//                     X-Auth-Provider: firebase
//     - firebase_id_token comes from Firebase SDK on frontend
//     - We verify it with Firebase Admin SDK
//
// Both methods attach req.admin so controllers work identically.
// =====================================================

const jwt     = require("jsonwebtoken");
const Admin   = require("../models/Admin");
const { verifyFirebaseIdToken } = require("../utils/firebase");

// ── Main guard — protects any route ───────────────
const verifyAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const token    = header.split(" ")[1];
    const provider = req.headers["x-auth-provider"]; // "firebase" or undefined

    let admin = null;

    // ── METHOD 2: Firebase token ───────────────────
    if (provider === "firebase") {
      const decoded = await verifyFirebaseIdToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid Firebase token. Please sign in again.",
        });
      }

      // Find the admin in MongoDB using their Firebase UID
      admin = await Admin.findOne({ firebaseUid: decoded.uid });

      // If not found by UID, try by email (first Firebase login — link accounts)
      if (!admin && decoded.email) {
        admin = await Admin.findOne({ email: decoded.email.toLowerCase() });

        if (admin) {
          // Link this Firebase UID to the existing admin account
          admin.firebaseUid  = decoded.uid;
          admin.authProvider = admin.authProvider === "local" ? "both" : "firebase";
          await admin.save({ validateBeforeSave: false });
        }
      }

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "No admin account found for this Firebase user. Ask a SuperAdmin to create your account first.",
        });
      }
    }

    // ── METHOD 1: Express JWT ──────────────────────
    else {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token. Please log in again.",
        });
      }

      admin = await Admin.findById(decoded.id);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin account not found.",
        });
      }
    }

    // ── Common checks for both methods ────────────
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact a SuperAdmin.",
      });
    }

    if (!admin.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before accessing the dashboard.",
      });
    }

    // Attach admin to request — available as req.admin in every controller
    req.admin = admin;
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};

// ── SuperAdmin-only guard ──────────────────────────
// Add AFTER verifyAdmin on routes only SuperAdmin can use
// Example: router.delete("/:id", verifyAdmin, requireSuperAdmin, deleteAdmin)
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "SuperAdmin") {
    return res.status(403).json({
      success: false,
      message: "SuperAdmin access required for this action.",
    });
  }
  next();
};

module.exports = { verifyAdmin, requireSuperAdmin };