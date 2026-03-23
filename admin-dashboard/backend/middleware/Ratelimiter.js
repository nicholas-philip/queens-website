// =====================================================
// middleware/rateLimiter.js
// Prevents brute-force and spam attacks.
// Each limiter tracks requests per IP address.
// =====================================================

const rateLimit = require("express-rate-limit");

const handler = (msg) => (req, res) =>
  res.status(429).json({ success: false, message: msg });

// All routes — 200 per 10 minutes
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  handler: handler("Too many requests. Please wait 10 minutes."),
});

// Login — 10 per 15 minutes (stops password brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  handler: handler("Too many login attempts. Wait 15 minutes and try again."),
});

// Register — 5 per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  handler: handler("Too many registration attempts from this IP."),
});

// Forgot password — 5 per hour (stops email spam)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  handler: handler("Too many password reset requests. Try again in 1 hour."),
});

// Resend verification — 3 per hour
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 3,
  standardHeaders: true, legacyHeaders: false,
  handler: handler("Too many verification emails requested. Try again in 1 hour."),
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
};