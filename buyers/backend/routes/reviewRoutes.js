// =====================================================
// routes/reviewRoutes.js
// Genuine product feedback system.
// =====================================================

const express = require("express");
const router = express.Router();
const { submitReview, getProductReviews, checkReviewReplies } = require("../controllers/reviewController");

const { reviewLimiter } = require("../middleware/rateLimiter");

// --- PUBLIC FEEDBACK ---
router.post("/send",      reviewLimiter, submitReview); // Submit a rate
router.post("/check-replies", checkReviewReplies); // Check for admin responses
router.get("/:productId", getProductReviews); // List all approved

module.exports = router;
