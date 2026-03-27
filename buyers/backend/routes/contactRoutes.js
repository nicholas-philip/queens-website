// =====================================================
// routes/contactRoutes.js
// Message handling for customers.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  contactController: { sendMessage },
  newsletterController: { subscribe, unsubscribe }
} = require("../controllers/reviewController");

const { contactLimiter, newsletterLimiter } = require("../middleware/rateLimiter");

// --- CUSTOMER SERVICE ---
router.post("/send",  contactLimiter,    sendMessage); // Contact form
router.post("/join",  newsletterLimiter, subscribe);   // Join button
router.get("/leave",  unsubscribe); // Marketing opt-out link

module.exports = router;
