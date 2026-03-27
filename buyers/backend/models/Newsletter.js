// =====================================================
// models/Newsletter.js
// Email subscribers for marketing newsletters.
// =====================================================

const mongoose = require("mongoose");
const crypto   = require("crypto");

const NewsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    isVerified: { type: Boolean, default: false },
    unsubToken: { type: String, default: () => crypto.randomBytes(20).toString("hex") },
    source:     { type: String, default: "website" }, 
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema);