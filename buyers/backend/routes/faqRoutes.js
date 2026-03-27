// =====================================================
// routes/faqRoutes.js
// Common questions and help center.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  faqController: { getFAQs, getFAQCategories, recordFAQView } 
} = require("../controllers/blogController");

// --- PUBLIC HELP ---
router.get("/",           getFAQs);       // Browse help topics
router.get("/categories", getFAQCategories); // Category index
router.patch("/:id/view", recordFAQView);   // Tracking stats

module.exports = router;
