// =====================================================
// middleware/Ratelimiter.js
// Prevents brute-force and spam attacks.
// Each limiter tracks requests per IP address.
// =====================================================

const rateLimit = require("express-rate-limit");

const handler = (msg) => (req, res) =>
  res.status(429).json({ success: false, message: msg });

// ── Global API limiter — 300 requests per 10 min ──
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: handler("Too many requests. Please wait and try again."),
});

// ── Login — 15 per 15 min (prevent brute-force) ───
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      15,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: handler("Too many login attempts. Wait 15 minutes and try again."),
});

// ── Register — 20 per hour ────────────────────────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: handler("Too many registration attempts from this IP. Try again in 1 hour."),
});

// ── Forgot password — 10 per hour (prevent email spam) ─
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: handler("Too many password reset requests. Try again in 1 hour."),
});

// ── Resend verification — 5 per hour ─────────────
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:       5,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: handler("Too many verification emails requested. Try again in 1 hour."),
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
};