// =====================================================
// routes/quizRoutes.js
// Personalized beauty matching.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  quizController: { submitQuiz } 
} = require("../controllers/loyaltyController");

// --- INTERACTIVE QUIZ ---
router.post("/submit", submitQuiz); // Answer processing & matching

module.exports = router;
