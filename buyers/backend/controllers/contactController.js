// =====================================================
// controllers/contactController.js
// Customer inquiries and feedback.
// =====================================================

const ContactMessage = require("../models/contactMessage");
const Notification = require("../models/Notification");

const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    await ContactMessage.create({ name, email, subject, message, ipAddress: req.ip });

    // Internal notice for CRM
    await Notification.push(
      "CRM_ALERT", 
      "New Contact Inquiry", 
      `${name} sent a message: ${subject.substring(0, 30)}...`, 
      "/admin/contacts"
    );

    res.status(201).json({ success: true, message: "Message sent! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage };
