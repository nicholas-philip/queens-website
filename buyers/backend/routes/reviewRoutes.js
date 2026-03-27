// =====================================================
// routes/reviewRoutes.js
// Genuine product feedback system.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  reviewController: { submitReview, getProductReviews } 
} = require("../controllers/reviewController");

const { reviewLimiter } = require("../middleware/rateLimiter");

// --- PUBLIC FEEDBACK ---
router.post("/send",      reviewLimiter, submitReview); // Submit a rate
router.get("/:productId", getProductReviews); // List all approved

module.exports = router;
