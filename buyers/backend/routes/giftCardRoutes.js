// =====================================================
// routes/giftCardRoutes.js
// Electronic gift card management.
// =====================================================

const express = require("express");
const router = express.Router();
const { purchaseGiftCard, validateGiftCard, checkBalance } = require("../controllers/alertController").giftCardController;

// --- DIGITAL GIFT CARDS ---
router.post("/buy",      purchaseGiftCard);  // Gift card checkout
router.post("/use",      validateGiftCard);  // Apply to order
router.get("/:code",     checkBalance);      // Check value link

module.exports = router;
