// =====================================================
// controllers/authController.js
//
// Handles ALL admin authentication:
//
// EXPRESS JWT FLOW (email + password):
//   POST /api/auth/register          → create account + send verification email
//   POST /api/auth/verify-email      → verify email with token from link
//   POST /api/auth/resend-verification → resend the verification email
//   POST /api/auth/login             → login → get JWT token
//   POST /api/auth/forgot-password   → send reset link to email
//   POST /api/auth/reset-password    → set new password using reset token
//   POST /api/auth/change-password   → change password while logged in
//   GET  /api/auth/me                → get logged-in admin profile
//   POST /api/auth/logout            → log action (JWT is stateless)
//
// FIREBASE FLOW:
//   POST /api/auth/firebase-login    → verify Firebase token → return admin profile
//   POST /api/auth/firebase-link     → link Firebase to existing local account
// =====================================================

const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");
const Admin    = require("../models/Admin");
const logActivity = require("../middleware/activityLogger");
const { sendEmail } = require("../utils/Emailservice");
const {
  verifyEmailTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  passwordChangedTemplate,
} = require("../utils/authEmailTemplates");
const { verifyFirebaseIdToken } = require("../utils/firebase");

// ── Generate Express JWT ───────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Build the frontend URL for email links ─────────
const clientUrl = () => process.env.ADMIN_CLIENT_URL || "http://localhost:3000";


// =====================================================
// REGISTER
// POST /api/auth/register
//
// Creates a new admin account and sends a
// verification email. Admin CANNOT log in until
// they click the link in the email.
// =====================================================
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check email is not already registered
  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  // Create the admin (password is hashed by pre-save hook in Admin model)
  const admin = await Admin.create({
    name,
    email,
    password,
    role:            role || "Manager",
    isEmailVerified: false, // must verify before login
    authProvider:    "local",
  });

  // Generate verification token (link) AND code (6-digit OTP)
  const { plainToken, plainCode } = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });

  // Build the link the admin clicks in their email
  const verificationUrl = `${clientUrl()}/verify-email?token=${plainToken}`;

  // Send the verification email (Template should be updated to include code)
  const { subject, html } = verifyEmailTemplate(admin.name, verificationUrl, plainCode);
  await sendEmail(admin.email, subject, html);

  res.status(201).json({
    success: true,
    message: `Account created! A verification email has been sent to ${admin.email}. Use the link in the email or the 6-digit code: ${plainCode} (shown here for dev/testing).`,
  });
};


// =====================================================
// VERIFY EMAIL
// POST /api/auth/verify-email
// Body: { token: "abc123..." }
//
// The frontend gets the token from the URL query
// e.g. /verify-email?token=abc123
// and sends it here.
// =====================================================
const verifyEmail = async (req, res) => {
  const { token, code } = req.body;

  if (!token && !code) {
    return res.status(400).json({
      success: false,
      message: "Verification token or code is required.",
    });
  }

  let admin;

  if (token) {
    // Hash the incoming plain token to compare with what's stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    admin = await Admin.findOne({
      emailVerificationToken:  hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpiry");
  } else if (code) {
    // Check for 6-digit numeric code
    admin = await Admin.findOne({
      emailVerificationCode:   code,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationCode +emailVerificationExpiry");
  }

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Verification link or code is invalid or has expired.",
    });
  }

  // Mark email as verified and clear verification fields
  admin.isEmailVerified        = true;
  admin.emailVerificationToken  = undefined;
  admin.emailVerificationCode   = undefined;
  admin.emailVerificationExpiry = undefined;
  await admin.save({ validateBeforeSave: false });

  // Send the welcome email
  const loginUrl = `${clientUrl()}/login`;
  const { subject, html } = welcomeTemplate(admin.name, loginUrl);
  await sendEmail(admin.email, subject, html);

  // Log in automatically after verification
  const jwtToken = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message: "Email verified successfully! Your account is now active.",
    token:   jwtToken,
    admin: {
      _id:   admin._id,
      name:  admin.name,
      email: admin.email,
      role:  admin.role,
    },
  });
};


// =====================================================
// RESEND VERIFICATION EMAIL
// POST /api/auth/resend-verification
// Body: { email: "admin@store.com" }
//
// If admin didn't get the email or it expired,
// they can request a new one.
// =====================================================
const resendVerification = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() })
    .select("+emailVerificationToken +emailVerificationExpiry");

  // Always return success even if email not found
  // (security: don't reveal whether email exists)
  const successMsg = `If ${email} is registered and unverified, a new verification email has been sent.`;

  if (!admin || admin.isEmailVerified) {
    return res.status(200).json({ success: true, message: successMsg });
  }

  // Generate a fresh token and code
  const { plainToken, plainCode } = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });

  const verificationUrl = `${clientUrl()}/verify-email?token=${plainToken}`;
  const { subject, html } = verifyEmailTemplate(admin.name, verificationUrl, plainCode);
  await sendEmail(admin.email, subject, html);

  res.status(200).json({ success: true, message: successMsg + ` Code: ${plainCode} (dev)` });
};


// =====================================================
// LOGIN
// POST /api/auth/login
// Body: { email, password }
//
// Returns a JWT token. Token must go in every
// subsequent request as:
//   Authorization: Bearer <token>
// =====================================================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // .select("+password") is needed because password has select:false in schema
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

  // Use vague error — don't tell attackers whether the email exists
  const invalidMsg = "Invalid email or password.";

  if (!admin || !admin.password) {
    return res.status(401).json({ success: false, message: invalidMsg });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Contact a SuperAdmin.",
    });
  }

  // Must verify email before logging in
  if (!admin.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address first. Check your inbox for the verification link.",
      action:  "VERIFY_EMAIL", // frontend can use this to show "Resend" button
    });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: invalidMsg });
  }

  // Update last login time
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken(admin._id);

  // Set req.admin temporarily for the activity log
  req.admin = admin;
  await logActivity(req, "ADMIN_LOGIN", `Logged in via email/password`);

  res.status(200).json({
    success: true,
    message: `Welcome back, ${admin.name}!`,
    token,
    admin: {
      _id:          admin._id,
      name:         admin.name,
      email:        admin.email,
      role:         admin.role,
      avatar:       admin.avatar,
      authProvider: admin.authProvider,
      lastLogin:    admin.lastLogin,
    },
  });
};


// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// Body: { email: "admin@store.com" }
//
// Sends a password reset link to the email.
// =====================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Always return success — don't reveal if email exists
  const successMsg = `If ${email} is registered, a password reset link has been sent.`;

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !admin.isActive) {
    return res.status(200).json({ success: true, message: successMsg });
  }

  // Firebase-only accounts have no password to reset
  if (admin.authProvider === "firebase") {
    return res.status(200).json({ success: true, message: successMsg });
  }

  // Generate reset token (link) AND code (OTP)
  const { plainToken, plainCode } = admin.generatePasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  // Build the reset link
  const resetUrl = `${clientUrl()}/reset-password?token=${plainToken}`;

  const { subject, html } = passwordResetTemplate(admin.name, resetUrl, plainCode);
  const sent = await sendEmail(admin.email, subject, html);

  if (!sent) {
    // Email failed — clear the token/code
    admin.passwordResetToken  = undefined;
    admin.passwordResetCode   = undefined;
    admin.passwordResetExpiry = undefined;
    await admin.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later.",
    });
  }

  res.status(200).json({ success: true, message: successMsg + ` Code: ${plainCode} (dev)` });
};


// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// Body: { token: "xyz789...", newPassword: "myNewPass123" }
//
// The frontend gets the token from the URL and
// sends it along with the new password.
// =====================================================
const resetPassword = async (req, res) => {
  const { token, code, newPassword } = req.body;

  if ((!token && !code) || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token/code and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  let admin;

  if (token) {
    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    admin = await Admin.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpiry");
  } else if (code) {
    // Check 6-digit numeric OTP
    admin = await Admin.findOne({
      passwordResetCode:   code,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetCode +passwordResetExpiry");
  }

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Password reset link or code is invalid or has expired.",
    });
  }

  // Set the new password (pre-save hook will hash it)
  admin.password           = newPassword;
  admin.passwordResetToken  = undefined;
  admin.passwordResetCode   = undefined;
  admin.passwordResetExpiry = undefined;
  await admin.save();

  // Send security alert email
  const { subject, html } = passwordChangedTemplate(admin.name);
  await sendEmail(admin.email, subject, html);

  // Log them in automatically after reset
  const jwtToken = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message: "Password reset successfully! You are now logged in.",
    token:   jwtToken,
  });
};


// =====================================================
// CHANGE PASSWORD  (must be logged in)
// POST /api/auth/change-password
// Body: { currentPassword, newPassword }
// Headers: Authorization: Bearer <token>
// =====================================================
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters.",
    });
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  // Firebase-only accounts may not have a local password
  if (!admin.password) {
    return res.status(400).json({
      success: false,
      message: "Your account uses Firebase login. Set a password from the settings page.",
    });
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  admin.password = newPassword;
  await admin.save();

  // Security alert
  const { subject, html } = passwordChangedTemplate(admin.name);
  await sendEmail(admin.email, subject, html);

  await logActivity(req, "CHANGED_PASSWORD", `Admin: ${admin.name}`);

  res.status(200).json({ success: true, message: "Password changed successfully." });
};


// =====================================================
// GET MY PROFILE  (must be logged in)
// GET /api/auth/me
// =====================================================
const getMyProfile = async (req, res) => {
  // req.admin is set by verifyAdmin middleware
  res.status(200).json({ success: true, admin: req.admin });
};


// =====================================================
// LOGOUT
// POST /api/auth/logout
//
// JWT is stateless — the real logout happens on
// the frontend by deleting the token from storage.
// We just log the action here.
// =====================================================
const logoutAdmin = async (req, res) => {
  await logActivity(req, "ADMIN_LOGOUT", `Logged out`);
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Delete your token on the client.",
  });
};


// =====================================================
// FIREBASE LOGIN
// POST /api/auth/firebase-login
// Body: { idToken: "<firebase_id_token_from_frontend>" }
//
// The frontend signs in via Firebase (e.g. Google),
// gets a Firebase ID Token, and sends it here.
// We verify it and return the admin's full profile.
// =====================================================
const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Firebase ID token is required.",
    });
  }

  // Verify the token with Firebase Admin SDK
  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid Firebase token. Please sign in again.",
    });
  }

  // Find admin by Firebase UID first, then by email
  let admin = await Admin.findOne({ firebaseUid: decoded.uid });

  if (!admin && decoded.email) {
    admin = await Admin.findOne({ email: decoded.email.toLowerCase() });

    if (admin) {
      // First time using Firebase — link the UID to this admin account
      admin.firebaseUid  = decoded.uid;
      admin.authProvider = admin.authProvider === "local" ? "both" : "firebase";
      // Auto-verify email since Firebase already verified it
      if (!admin.isEmailVerified) {
        admin.isEmailVerified = true;
      }
      await admin.save({ validateBeforeSave: false });
    }
  }

  if (!admin) {
    return res.status(403).json({
      success: false,
      message: "No admin account found for this Firebase user. Ask a SuperAdmin to create your account.",
    });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated.",
    });
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  req.admin = admin;
  await logActivity(req, "ADMIN_LOGIN", `Logged in via Firebase`);

  res.status(200).json({
    success: true,
    message: `Welcome back, ${admin.name}!`,
    admin: {
      _id:          admin._id,
      name:         admin.name,
      email:        admin.email,
      role:         admin.role,
      avatar:       admin.avatar,
      authProvider: admin.authProvider,
      lastLogin:    admin.lastLogin,
    },
    // No JWT here — frontend uses Firebase token for subsequent requests
    // and sends X-Auth-Provider: firebase header
  });
};


// =====================================================
// FIREBASE LINK
// POST /api/auth/firebase-link
// Body: { idToken: "<firebase_id_token>" }
// Headers: Authorization: Bearer <jwt_token>
//
// Links a Firebase account to an existing local account.
// Admin must already be logged in via JWT.
// =====================================================
const firebaseLink = async (req, res) => {
  const { idToken } = req.body;

  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid Firebase token." });
  }

  // Check if this Firebase UID is already linked to another account
  const alreadyLinked = await Admin.findOne({ firebaseUid: decoded.uid });
  if (alreadyLinked && alreadyLinked._id.toString() !== req.admin._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "This Firebase account is already linked to a different admin.",
    });
  }

  // Link the Firebase UID to the currently logged-in admin
  const admin        = await Admin.findById(req.admin._id);
  admin.firebaseUid  = decoded.uid;
  admin.authProvider = "both"; // now supports both login methods
  await admin.save({ validateBeforeSave: false });

  await logActivity(req, "LINKED_FIREBASE", `Firebase UID linked to account`);

  res.status(200).json({
    success: true,
    message: "Firebase account linked successfully. You can now sign in with either method.",
    authProvider: admin.authProvider,
  });
};


module.exports = {
  registerAdmin,
  verifyEmail,
  resendVerification,
  loginAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
  getMyProfile,
  logoutAdmin,
  firebaseLogin,
  firebaseLink,
};