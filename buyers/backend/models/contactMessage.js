// =====================================================
// models/ContactMessage.js
// Messages from the Contact Us page.
// =====================================================

const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    phone:   { type: String, default: "",    trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead:  { type: Boolean, default: false },
    isReplied:{ type: Boolean, default: false },
    ipAddress:{ type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);