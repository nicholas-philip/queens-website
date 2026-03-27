// =====================================================
// routes/alertRoutes.js
// Stock notifications for out-of-stock products.
// =====================================================

const express = require("express");
const router = express.Router();
const { subscribeBackInStock } = require("../controllers/alertController").alertController;

// --- NOTIFICATIONS ---
router.post("/back-in-stock", subscribeBackInStock); // Email alert signup

module.exports = router;
