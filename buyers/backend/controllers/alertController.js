// =====================================================
// controllers/alertController.js
// 🚨 EMERGENCY RESTORATION 🚨
//
// Catch-all controller for:
// 1. Alerts (Back-in-stock, Push Notifications)
// 2. Returns & Exchanges
// 3. Digital Gift Cards
// =====================================================

const DeviceToken = require("../models/DeviceToken");
const BackInStockAlert = require("../models/BackinStockAlert");
const ReturnRequest = require("../models/ReturnRequest");
const GiftCard = require("../models/GiftCard");

// ── 1. ALERTS & NOTIFICATIONS ─────────────────────

/**
 * Register FCM device token for push notifications.
 * POST /api/alerts/subscribe-push
 */
const subscribePush = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Device token is required." });

    const device = await DeviceToken.findOneAndUpdate(
      { token },
      { token, platform: platform || "web", lastUsed: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Subscribed to push! 🔔", device });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Register email for back-in-stock alerts.
 * POST /api/alerts/back-in-stock
 */
const subscribeBackInStock = async (req, res) => {
  try {
    const { productId, email, firstName } = req.body;
    if (!productId || !email) return res.status(400).json({ success: false, message: "Missing required fields." });

    const alert = await BackInStockAlert.findOneAndUpdate(
      { productId, email },
      { productId, email, firstName: firstName || "", notified: false },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: "We'll notify you! 📧", alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 2. RETURNS & EXCHANGES ─────────────────────────

const returnController = {
  /**
   * Submit a new return or exchange request.
   * POST /api/returns
   */
  submitReturn: async (req, res) => {
    try {
      const { orderNumber, customerEmail, type, reason, items } = req.body;
      if (!orderNumber || !customerEmail || !type || !reason) {
        return res.status(400).json({ success: false, message: "Missing required return fields." });
      }

      // In a real app, we would verify the order exists here.
      // Reconstructing with basic creation for restoration.
      const returnRequest = await ReturnRequest.create({
        ...req.body,
        status: "Pending"
      });

      res.status(201).json({
        success: true,
        message: "Return request submitted successfully. We will review it shortly. 📦",
        returnRequest
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Track status of a return request.
   * GET /api/returns/track?orderNumber=...
   */
  trackReturn: async (req, res) => {
    try {
      const { orderNumber } = req.query;
      if (!orderNumber) return res.status(400).json({ success: false, message: "Order number is required." });

      const requests = await ReturnRequest.find({ orderNumber }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// ── 3. DIGITAL GIFT CARDS ─────────────────────────

const giftCardController = {
  /**
   * Purchase a new digital gift card.
   * POST /api/gift-cards/buy
   */
  purchaseGiftCard: async (req, res) => {
    try {
      const { initialBalance, purchaserEmail, purchaserName, recipientEmail, recipientName } = req.body;
      if (!initialBalance || !purchaserEmail || !recipientEmail) {
        return res.status(400).json({ success: false, message: "Missing required gift card fields." });
      }

      // Default expiry 1 year from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const giftCard = await GiftCard.create({
        ...req.body,
        balance: initialBalance,
        expiryDate
      });

      res.status(201).json({
        success: true,
        message: "Gift card purchased successfully! It will be sent to the recipient. 🎁",
        giftCard
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Validate a gift card code and check its balance.
   * POST /api/gift-cards/use
   */
  validateGiftCard: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ success: false, message: "Gift card code is required." });

      const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), isActive: true });
      if (!giftCard) return res.status(404).json({ success: false, message: "Invalid or inactive gift card." });

      if (new Date() > giftCard.expiryDate) {
        return res.status(400).json({ success: false, message: "This gift card has expired." });
      }

      if (giftCard.balance <= 0) {
        return res.status(400).json({ success: false, message: "This gift card has zero balance." });
      }

      res.status(200).json({
        success: true,
        message: "Gift card validated.",
        balance: giftCard.balance,
        code: giftCard.code
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Public check balance link.
   * GET /api/gift-cards/:code
   */
  checkBalance: async (req, res) => {
    try {
      const { code } = req.params;
      const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
      if (!giftCard) return res.status(404).json({ success: false, message: "Gift card not found." });

      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        isActive: giftCard.isActive && (new Date() < giftCard.expiryDate)
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// ── EXPORTS ───────────────────────────────────────

module.exports = {
  // Top-level for alertRoutes.js
  subscribePush,
  subscribeBackInStock,

  // Nested for returnRoutes.js and giftCardRoutes.js
  returnController,
  giftCardController
};