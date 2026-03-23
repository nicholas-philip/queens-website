// =====================================================
// models/Admin.js
//
// Admin accounts now support:
//   - Email verification (must verify before logging in)
//   - Forgot password / reset password via email token
//   - Firebase UID linking (so Firebase Auth users
//     can also access the API)
//
// Roles:
//   SuperAdmin → full access + manage other admins
//   Manager    → products, orders, invoices only
// =====================================================

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    // select:false → never returned in queries unless you write .select("+password")
    password: {
      type:      String,
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
      // Not required at top level because Firebase admins may have no password
    },

    role: {
      type:    String,
      enum:    ["SuperAdmin", "Manager"],
      default: "Manager",
    },

    avatar:   { type: String,  default: null },
    phone:    { type: String,  default: null },
    isActive: { type: Boolean, default: true },
    lastLogin:{ type: Date,    default: null },

    // ── Auth Provider ───────────────────────────
    // "local"    → logged in with email + password (Express JWT)
    // "firebase" → logged in through Firebase Auth (Google, email link, etc.)
    // "both"     → has both methods linked
    authProvider: {
      type:    String,
      enum:    ["local", "firebase", "both"],
      default: "local",
    },

    // Firebase UID — set when admin logs in via Firebase
    // Used by verifyFirebaseToken middleware to find this admin record
    firebaseUid: {
      type:    String,
      default: null,
      sparse:  true, // allows multiple null values (not all admins have Firebase)
      unique:  true,
    },

    // ── Email Verification ──────────────────────
    // isEmailVerified: must be true before admin can log in
    isEmailVerified: {
      type:    Boolean,
      default: false,
    },

    // A secure random token sent in the verification email link
    // e.g. /verify-email?token=abc123
    emailVerificationToken: {
      type:   String,
      select: false, // hidden from normal queries
    },

    // Token expires after 24 hours — admin must re-request if they miss it
    emailVerificationExpiry: {
      type:   Date,
      select: false,
    },

    // ── Password Reset ──────────────────────────
    // A secure random token sent in the reset email link
    // e.g. /reset-password?token=xyz789
    passwordResetToken: {
      type:   String,
      select: false,
    },

    // Token expires after 1 hour for security
    passwordResetExpiry: {
      type:   Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Auto-hash password before saving ──────────────
AdminSchema.pre("save", async function (next) {
  // Only hash if the password field was actually changed
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Compare entered password with stored hash ──────
// Usage: const ok = await admin.comparePassword("mypass123")
AdminSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Generate a secure email verification token ─────
// Creates a random token, hashes it for storage,
// returns the plain token (sent in the email link)
AdminSchema.methods.generateEmailVerificationToken = function () {
  // Generate a cryptographically secure random string
  const plainToken = crypto.randomBytes(32).toString("hex");

  // Hash it before storing in DB (so even if DB is leaked, token is useless)
  this.emailVerificationToken  = crypto.createHash("sha256").update(plainToken).digest("hex");
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Return the PLAIN token — this is what goes in the email link
  return plainToken;
};

// ── Generate a secure password reset token ─────────
// Same pattern as above — plain token in email, hashed in DB
AdminSchema.methods.generatePasswordResetToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken  = crypto.createHash("sha256").update(plainToken).digest("hex");
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour only

  return plainToken;
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);