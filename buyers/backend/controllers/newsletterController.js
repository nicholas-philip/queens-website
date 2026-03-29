// =====================================================
// controllers/newsletterController.js
// Newsletter subscription management.
// =====================================================

const Newsletter = require("../models/Newsletter");

const subscribe = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    
    const exists = await Newsletter.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(200).json({ success: true, message: "You're already subscribed! 💋" });
    
    await Newsletter.create({ email: email.toLowerCase(), firstName, isVerified: true });
    res.status(201).json({ success: true, message: "Welcome to the family! 💋" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isActive: false });
    res.status(200).json({ success: true, message: "Successfully unsubscribed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { subscribe, unsubscribe };
