// =====================================================
// models/BeautyQuiz.js
// "Find Your Perfect Match" quiz.
// =====================================================

const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema(
  {
    answers: {
      skinType:      { type: String }, 
      skinTone:      { type: String }, 
      skinConcerns:  { type: [String] }, 
      makeupStyle:   { type: String }, 
      perfumeFamily: { type: String }, 
      budget:        { type: String }, 
      ageRange:      { type: String }, 
    },
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    email:     { type: String, default: null, lowercase: true },
    firstName: { type: String, default: "" },
    subscribedNewsletter: { type: Boolean, default: false },
    sessionId: { type: String, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema);