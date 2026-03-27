// =====================================================
// routes/paymentRoutes.js
// Paystack Ghana payment routes
// IMPORTANT: Webhook route uses raw body (for signature verification)
// =====================================================

const express = require("express");
const router  = express.Router();
const { initializePayment, handleWebhook, verifyPayment } = require("../controllers/paymentController");
const { checkoutLimiter } = require("../middleware/rateLimiter");

// POST /api/payment/initialize — Call this before redirecting to Paystack
router.post("/initialize", checkoutLimiter, initializePayment);

// POST /api/payment/webhook — Paystack calls this (raw body required for sig check)
// express.raw is applied in server.js specifically for this route
router.post("/webhook", handleWebhook);

// GET /api/payment/verify/:reference — Call on success redirect page
router.get("/verify/:reference", verifyPayment);

module.exports = router;
