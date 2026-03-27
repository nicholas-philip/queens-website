// =====================================================
// routes/orderRoutes.js
// Guest checkout, order tracking and lead capture.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  placeOrder, 
  trackOrder, 
  recordTransaction, 
  validateCoupon, 
  createLead 
} = require("../controllers/orderController");

const { checkoutLimiter } = require("../middleware/rateLimiter");

// --- PUBLIC ACCESS ---
router.post("/",         checkoutLimiter, placeOrder); // Checkout button
router.get("/track/:id", trackOrder); // Tracking number search

// --- LEAD CAPTURE ---
router.post("/leads",    createLead); // Save potential customer info

// --- PAYMENTS & COUPONS ---
router.post("/pay",      recordTransaction); // Webhook or manual confirm
router.post("/coupon",   validateCoupon); // Apply coupon button

module.exports = router;
