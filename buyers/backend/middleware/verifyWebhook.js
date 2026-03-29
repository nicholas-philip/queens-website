const { verifyWebhookSignature } = require("../utils/paystackService");

/**
 * Verifies the X-Paystack-Signature header against the raw body.
 * Returns 401 immediately if the signature is invalid or missing.
 */
const verifyPaystackWebhook = (req, res, next) => {
  const signature = req.headers["x-paystack-signature"];

  if (!signature) {
    return res.status(401).json({ success: false, message: "Missing webhook signature." });
  }

  // req.rawBody must be populated by the express.json verify option in server.js
  if (!req.rawBody) {
    console.error("❌ [verifyWebhook] rawBody is missing. Ensure server.js captures it.");
    return res.status(500).json({ success: false, message: "Server misconfiguration: Raw body not captured." });
  }

  if (!verifyWebhookSignature(req.rawBody, signature)) {
    console.warn("⚠️ [verifyWebhook] Invalid Paystack signature — request rejected.");
    return res.status(401).json({ success: false, message: "Invalid webhook signature." });
  }

  next();
};

module.exports = { verifyPaystackWebhook };
