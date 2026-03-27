// =====================================================
// routes/loyaltyRoutes.js
// GlossyKiss Rewards - Points & Referrals.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  loyaltyController: { getLoyaltyAccount, getLoyaltyHistory, redeemPoints },
  referralController: { registerReferral, validateReferralCode, getReferralStats }
} = require("../controllers/loyaltyController");

// --- LOYALTY ---
router.get("/:phone",          getLoyaltyAccount); // Dashboard profile
router.get("/:phone/history",  getLoyaltyHistory); // Transaction log
router.post("/redeem",         redeemPoints);       // Cash out points

// --- REFERRALS ---
router.post("/refer",          registerReferral);   // Get my link
router.get("/refer/check/:id", validateReferralCode); // Friend enters code
router.get("/refer/stats/:id", getReferralStats);   // My referral growth

module.exports = router;
