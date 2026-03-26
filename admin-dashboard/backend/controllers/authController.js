// =====================================================
// controllers/authController.js
//
// 🔐 ALL admin authentication in one place:
//
// EXPRESS JWT FLOW (email + password):
//   POST /auth/register          → create account + send verification email
//   POST /auth/verify-email      → verify email with token or 6-digit code
//   POST /auth/resend-verification → resend verification email
//   POST /auth/login             → login → return JWT token
//   POST /auth/forgot-password   → send password reset link
//   POST /auth/reset-password    → set new password using token or code
//   POST /auth/change-password   → change password while logged in
//   GET  /auth/me                → get logged-in admin profile
//   POST /auth/logout            → log action (JWT is stateless)
//
// FIREBASE FLOW:
//   POST /auth/firebase-login    → verify Firebase token → return admin profile
//   POST /auth/firebase-link     → link Firebase to existing local account
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

const IS_DEV = process.env.NODE_ENV !== "production";

// ── Generate Express JWT ───────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Build production-safe URL for email links ──────
const clientUrl = () =>
  process.env.ADMIN_CLIENT_URL ||
  (IS_DEV ? "http://localhost:5173" : "https://queens-website-three.vercel.app");


// =====================================================
// REGISTER
// POST /auth/register
// Creates account + sends verification email.
// Admin CANNOT log in until email is verified.
// =====================================================
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role:            role || "Manager",
    isEmailVerified: false,
    authProvider:    "local",
  });

  const { plainToken, plainCode } = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });

  const verificationUrl = `${clientUrl()}/auth/verify-email?token=${plainToken}`;
  const { subject, html } = verifyEmailTemplate(admin.name, verificationUrl, plainCode);
  await sendEmail(admin.email, subject, html);

  res.status(201).json({
    success: true,
    message: `Account created! A verification email has been sent to ${admin.email}. Please check your inbox and verify before logging in.`,
    // Only expose the code in development for easy testing
    ...(IS_DEV && { devCode: plainCode }),
  });
};


// =====================================================
// VERIFY EMAIL
// POST /auth/verify-email
// Body: { token } or { code }
// =====================================================
const verifyEmail = async (req, res) => {
  const { token, code } = req.body;

  if (!token && !code) {
    return res.status(400).json({
      success: false,
      message: "A verification token or 6-digit code is required.",
    });
  }

  let admin;

  if (token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    admin = await Admin.findOne({
      emailVerificationToken:  hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationCode +emailVerificationExpiry");
  } else if (code) {
    admin = await Admin.findOne({
      emailVerificationCode:   code,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationCode +emailVerificationExpiry");
  }

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Verification link or code is invalid or has expired. Please request a new one.",
    });
  }

  // Activate the account
  admin.isEmailVerified        = true;
  admin.emailVerificationToken  = undefined;
  admin.emailVerificationCode   = undefined;
  admin.emailVerificationExpiry = undefined;
  await admin.save({ validateBeforeSave: false });

  // Send welcome email (non-blocking)
  const loginUrl = `${clientUrl()}/auth/login`;
  const { subject, html } = welcomeTemplate(admin.name, loginUrl);
  sendEmail(admin.email, subject, html).catch(() => {});

  // Auto-login after verification
  const jwtToken = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message:  "Email verified! Your account is now active.",
    token:    jwtToken,
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
// POST /auth/resend-verification
// Body: { email }
// =====================================================
const resendVerification = async (req, res) => {
  const { email } = req.body;
  // Vague success response to prevent email enumeration
  const successMsg = `If ${email} is registered and unverified, a new verification email has been sent.`;

  const admin = await Admin.findOne({ email: email.toLowerCase() })
    .select("+emailVerificationToken +emailVerificationExpiry");

  if (!admin || admin.isEmailVerified) {
    return res.status(200).json({ success: true, message: successMsg });
  }

  const { plainToken, plainCode } = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });

  const verificationUrl = `${clientUrl()}/auth/verify-email?token=${plainToken}`;
  const { subject, html } = verifyEmailTemplate(admin.name, verificationUrl, plainCode);
  await sendEmail(admin.email, subject, html);

  res.status(200).json({
    success: true,
    message: successMsg,
    ...(IS_DEV && { devCode: plainCode }),
  });
};


// =====================================================
// LOGIN
// POST /auth/login
// Body: { email, password }
// Returns JWT token. Use in: Authorization: Bearer <token>
// =====================================================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

  // Deliberately vague — don't tell attackers if the email exists
  const invalidMsg = "Invalid email or password.";

  if (!admin || !admin.password) {
    return res.status(401).json({ success: false, message: invalidMsg });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Please contact a SuperAdmin.",
    });
  }

  if (!admin.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address first. Check your inbox for the verification link.",
      action:  "VERIFY_EMAIL", // frontend uses this to show "Resend" button
    });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: invalidMsg });
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // Temporarily attach admin to req for activity logger
  req.admin = admin;
  await logActivity(req, "ADMIN_LOGIN", "Logged in via email/password");

  const token = generateToken(admin._id);

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
// POST /auth/forgot-password
// Body: { email }
// =====================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const successMsg = `If ${email} is registered, a password reset link has been sent.`;

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !admin.isActive) {
    return res.status(200).json({ success: true, message: successMsg });
  }

  // Firebase-only accounts have no password to reset
  if (admin.authProvider === "firebase") {
    return res.status(200).json({ success: true, message: successMsg });
  }

  const { plainToken, plainCode } = admin.generatePasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${clientUrl()}/auth/reset-password?token=${plainToken}`;
  const { subject, html } = passwordResetTemplate(admin.name, resetUrl, plainCode);
  const sent = await sendEmail(admin.email, subject, html);

  if (!sent) {
    // Email delivery failed — clear the tokens so they can try again
    admin.passwordResetToken  = undefined;
    admin.passwordResetCode   = undefined;
    admin.passwordResetExpiry = undefined;
    await admin.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later.",
    });
  }

  res.status(200).json({
    success: true,
    message: successMsg,
    ...(IS_DEV && { devCode: plainCode }),
  });
};


// =====================================================
// RESET PASSWORD
// POST /auth/reset-password
// Body: { token, newPassword } or { code, newPassword }
// =====================================================
const resetPassword = async (req, res) => {
  const { token, code, newPassword } = req.body;

  if ((!token && !code) || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "A reset token/code and a new password are required.",
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    admin = await Admin.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetCode +passwordResetExpiry");
  } else if (code) {
    admin = await Admin.findOne({
      passwordResetCode:   code,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetCode +passwordResetExpiry");
  }

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "This reset link or code is invalid or has expired. Please request a new one.",
    });
  }

  admin.password           = newPassword; // pre-save hook hashes this
  admin.passwordResetToken  = undefined;
  admin.passwordResetCode   = undefined;
  admin.passwordResetExpiry = undefined;
  await admin.save();

  // Security alert email (non-blocking)
  const { subject, html } = passwordChangedTemplate(admin.name);
  sendEmail(admin.email, subject, html).catch(() => {});

  // Auto-login after reset
  const jwtToken = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message: "Password reset successfully! You are now signed in.",
    token:   jwtToken,
  });
};


// =====================================================
// CHANGE PASSWORD  (must be logged in)
// POST /auth/change-password
// Body: { currentPassword, newPassword }
// =====================================================
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are both required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from your current password.",
    });
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  if (!admin.password) {
    return res.status(400).json({
      success: false,
      message: "Your account uses Google/Firebase login. Set a password from Settings.",
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

  // Security alert email (non-blocking)
  const { subject, html } = passwordChangedTemplate(admin.name);
  sendEmail(admin.email, subject, html).catch(() => {});

  await logActivity(req, "CHANGED_PASSWORD", `Admin: ${admin.name}`);

  res.status(200).json({ success: true, message: "Password changed successfully." });
};


// =====================================================
// GET MY PROFILE (must be logged in)
// GET /auth/me
// =====================================================
const getMyProfile = async (req, res) => {
  // req.admin is populated by verifyAdmin middleware
  res.status(200).json({ success: true, admin: req.admin });
};


// =====================================================
// LOGOUT
// POST /auth/logout
// JWT is stateless — real logout is done client-side
// by deleting the stored token.
// =====================================================
const logoutAdmin = async (req, res) => {
  await logActivity(req, "ADMIN_LOGOUT", "Logged out");
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};


// =====================================================
// FIREBASE LOGIN
// POST /auth/firebase-login
// Body: { idToken: "<firebase_id_token_from_frontend>" }
//
// 🔒 SECURITY POLICY:
// Google sign-in only works if the email already has
// an admin account created by a SuperAdmin.
// We do NOT auto-create accounts from Google Sign-In.
// (Exception: if zero admins exist, first Google user
// becomes SuperAdmin to bootstrap the system.)
// =====================================================
const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Firebase ID token is required.",
    });
  }

  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid Firebase token. Please sign in again.",
    });
  }

  // Look up the admin by Firebase UID first (fastest path after first login)
  let admin = await Admin.findOne({ firebaseUid: decoded.uid });

  // Not found by UID — try by email (first time using Google on an existing account)
  if (!admin && decoded.email) {
    admin = await Admin.findOne({ email: decoded.email.toLowerCase() });

    if (admin) {
      // Link this Google account to the existing admin record
      admin.firebaseUid  = decoded.uid;
      admin.authProvider = admin.authProvider === "local" ? "both" : "firebase";
      if (!admin.isEmailVerified) admin.isEmailVerified = true; // Google has already verified it
      await admin.save({ validateBeforeSave: false });
    }
  }

  // ── Bootstrap: first admin ever ───────────────────
  if (!admin) {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      // First person to ever sign in becomes SuperAdmin
      admin = await Admin.create({
        name:            decoded.name || "Super Admin",
        email:           decoded.email.toLowerCase(),
        role:            "SuperAdmin",
        firebaseUid:     decoded.uid,
        authProvider:    "firebase",
        isEmailVerified: true,
        isActive:        true,
        avatar:          decoded.picture || null,
      });
      console.log(`🆕 Bootstrap: SuperAdmin created via Google → ${admin.email}`);
    } else {
      // Unknown Google account — reject
      return res.status(401).json({
        success: false,
        message: "No admin account found for this Google address. Ask your SuperAdmin to create your account first.",
      });
    }
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Contact a SuperAdmin.",
    });
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  req.admin = admin;
  await logActivity(req, "ADMIN_LOGIN", "Logged in via Google/Firebase");

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
    // No JWT returned — frontend uses Firebase token with X-Auth-Provider: firebase header
  });
};


// =====================================================
// FIREBASE LINK
// POST /auth/firebase-link
// Body: { idToken: "<firebase_id_token>" }
// Admin must already be logged in via JWT.
// Links Google account to their existing local account.
// =====================================================
const firebaseLink = async (req, res) => {
  const { idToken } = req.body;

  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid Firebase token." });
  }

  // Make sure this Google account isn't already linked to a different admin
  const alreadyLinked = await Admin.findOne({ firebaseUid: decoded.uid });
  if (alreadyLinked && alreadyLinked._id.toString() !== req.admin._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "This Google account is already linked to a different admin.",
    });
  }

  const admin        = await Admin.findById(req.admin._id);
  admin.firebaseUid  = decoded.uid;
  admin.authProvider = "both";
  if (decoded.picture && !admin.avatar) admin.avatar = decoded.picture;
  await admin.save({ validateBeforeSave: false });

  await logActivity(req, "LINKED_FIREBASE", "Google account linked");

  res.status(200).json({
    success: true,
    message: "Google account linked successfully! You can now sign in with either method.",
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