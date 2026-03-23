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

    // A 6-digit numeric code for manual verification
    emailVerificationCode: {
      type:   String,
      select: false,
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

    // A 6-digit numeric code for manual password reset
    passwordResetCode: {
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
AdminSchema.pre("save", async function () {
  // Only hash if the password field was actually changed
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ── Compare entered password with stored hash ──────
// Usage: const ok = await admin.comparePassword("mypass123")
AdminSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Generate a secure email verification token ─────
// ── Generate a secure email verification token ─────
// Creates a random token + a 6-digit numeric code.
// Returns an object: { plainToken, plainCode }
AdminSchema.methods.generateEmailVerificationToken = function () {
  // 1. Generate the long link token
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken  = crypto.createHash("sha256").update(plainToken).digest("hex");

  // 2. Generate a 6-digit numeric verification code (OTP)
  const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = plainCode;

  // 3. Expiry (24 hours for both)
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 

  return { plainToken, plainCode };
};

// ── Generate a secure password reset token ─────────
// Creates a random token + a 6-digit numeric code.
// Returns an object: { plainToken, plainCode }
AdminSchema.methods.generatePasswordResetToken = function () {
  // 1. Link token (hashed in DB)
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken  = crypto.createHash("sha256").update(plainToken).digest("hex");

  // 2. Numeric OTP (stored as plain string)
  const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetCode = plainCode;

  // 3. Expiry (1 hour only)
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); 

  return { plainToken, plainCode };
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);