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
  createLead,
  getMyOrdersHistory,
  claimOrder
} = require("../controllers/orderController");

const { checkoutLimiter } = require("../middleware/rateLimiter");

// --- PUBLIC ACCESS ---
router.post("/",         checkoutLimiter, placeOrder); // Checkout button
router.get("/track/:id", trackOrder); // Tracking number search
router.get("/my-history",   getMyOrdersHistory); // List all orders for the current session (from headers)
router.patch("/claim-secure", claimOrder); // Claim and link an order to current session

// --- LEAD CAPTURE ---
router.post("/leads",    createLead); // Save potential customer info

// --- PAYMENTS & COUPONS ---
router.post("/pay",      recordTransaction); // Webhook or manual confirm
router.post("/coupon",   validateCoupon); // Apply coupon button

module.exports = router;
