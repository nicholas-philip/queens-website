// =====================================================
// routes/shippingRoutes.js
// Delivery fee calculations and zones.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  shippingController: { getShippingZones, calculateShipping } 
} = require("../controllers/blogController");

// --- PUBLIC DATA ---
router.get("/zones",      getShippingZones);  // Price list per state
router.post("/calculate", calculateShipping); // Real-time estimator

module.exports = router;
