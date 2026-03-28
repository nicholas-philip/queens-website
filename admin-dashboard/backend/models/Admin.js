// =====================================================
// models/Admin.js
//
// Admin accounts with full auth support:
//   - Email + password (Express JWT)
//   - Google OAuth (Firebase)
//   - Email verification before first login
//   - Forgot / reset password via token + OTP
//
// Roles:
//   SuperAdmin → full access + manage other admins
//   Manager    → products, orders, invoices
//   Support    → read-only + customer comms
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
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
    },

    // select:false → hidden from queries unless .select("+password")
    password: {
      type:      String,
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },

    role: {
      type:    String,
      enum:    ["SuperAdmin", "Manager", "Support"],
      default: "Manager",
    },

    permissions: [{ type: String }],
    avatar:    { type: String,  default: null },
    phone:     { type: String,  default: null },
    isActive:  { type: Boolean, default: true },
    lastLogin: { type: Date,    default: null },

    // ── Auth Provider ─────────────────────────────
    // "local"    → email + password (JWT)
    // "firebase" → Firebase / Google
    // "both"     → both methods linked
    authProvider: {
      type:    String,
      enum:    ["local", "firebase", "both"],
      default: "local",
    },

    // Firebase UID — linked after first Google sign-in
    firebaseUid: {
      type:    String,
      unique:  true,
      sparse:  true, // Allows documents to NOT have this field
      default: undefined,
    },

    // ── Email Verification ────────────────────────
    isEmailVerified: { type: Boolean, default: false },

    emailVerificationToken: { type: String, select: false },
    emailVerificationCode:  { type: String, select: false },
    emailVerificationExpiry:{ type: Date,   select: false },

    // ── Password Reset ────────────────────────────
    passwordResetToken:  { type: String, select: false },
    passwordResetCode:   { type: String, select: false },
    passwordResetExpiry: { type: Date,   select: false },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────
AdminSchema.index({ createdAt: -1 });

// ── Auto-hash password before saving ─────────────
AdminSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12); // 12 rounds for production
});

// ── Compare entered password with stored hash ─────
AdminSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Generate email verification token + OTP ───────
AdminSchema.methods.generateEmailVerificationToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken  = crypto.createHash("sha256").update(plainToken).digest("hex");

  const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode   = plainCode;

  // Both expire in 24 hours
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { plainToken, plainCode };
};

// ── Generate password reset token + OTP ───────────
AdminSchema.methods.generatePasswordResetToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken  = crypto.createHash("sha256").update(plainToken).digest("hex");

  const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetCode   = plainCode;

  // Expires in 1 hour
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);

  return { plainToken, plainCode };
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);