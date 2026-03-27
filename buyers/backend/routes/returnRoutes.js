// =====================================================
// routes/returnRoutes.js
// Specialized returns and exchanges policy.
// =====================================================

const express = require("express");
const router = express.Router();
const { submitReturn, trackReturn } = require("../controllers/alertController").returnController;

// --- ORDERS RETURNS ---
router.post("/",       submitReturn); // Request a refund/exchange
router.get("/track",   trackReturn);  // Check request status

module.exports = router;
