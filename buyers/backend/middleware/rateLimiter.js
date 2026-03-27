// =====================================================
// middleware/rateLimiter.js
// Spam protection for critical store endpoints.
// =====================================================

const rateLimit = require("express-rate-limit");

const handler = (msg) => (req, res) => {
  res.status(429).json({ 
    success: false, 
    message: msg 
  });
};

// General API protection
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 300, 
  handler: handler("Too many requests from this IP. Please wait 10 minutes.")
});

// Checkout / Conversion protection
const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 15, 
  handler: handler("Too many orders attempted. Please try again in 1 hour.")
});

// Review submissions
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: handler("Too many reviews submitted. Save some for tomorrow!")
});

// Newsletter signups
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: handler("Too many subscription attempts. Please try again later.")
});

// Contact Us form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: handler("Message limit reached. Please try again later.")
});

module.exports = {
  apiLimiter,
  checkoutLimiter,
  reviewLimiter,
  newsletterLimiter,
  contactLimiter
};