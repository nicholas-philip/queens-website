// =====================================================
// routes/paymentRoutes.js
// Paystack Ghana payment routes
// IMPORTANT: Webhook route uses raw body (for signature verification)
// =====================================================

const express = require("express");
const router  = express.Router();
const { initializePayment, handleWebhook, verifyPayment } = require("../controllers/paymentController");
const { checkoutLimiter } = require("../middleware/rateLimiter");

const { verifyPaystackWebhook } = require("../middleware/verifyWebhook");

// POST /api/payment/initialize — Call this before redirecting to Paystack
router.post("/initialize", checkoutLimiter, initializePayment);

// POST /api/payment/webhook — Paystack calls this (raw body captured in server.js)
router.post("/webhook", verifyPaystackWebhook, handleWebhook);

// GET /api/payment/verify/:reference — Call on success redirect page
router.get("/verify/:reference", verifyPayment);

module.exports = router;
