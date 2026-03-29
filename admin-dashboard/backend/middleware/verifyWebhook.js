// =====================================================
// middleware/verifyWebhook.js
//
// Guards any route that receives raw Paystack webhook
// events. Signature verification prevents fake "Success"
// webhook posts from marking orders paid.
//
// Usage in routes/index.js:
//   router.post("/transactions", verifyPaystackWebhook, createTransaction);
// =====================================================

const crypto = require("crypto");

/**
 * Verifies the X-Paystack-Signature header against the raw body.
 * Returns 401 immediately if the signature is invalid or missing.
 */
const verifyPaystackWebhook = (req, res, next) => {
  const secret    = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  if (!secret) {
    console.error("❌ [verifyWebhook] PAYSTACK_SECRET_KEY is not set.");
    return res.status(500).json({ success: false, message: "Server misconfiguration." });
  }

  if (!signature) {
    return res.status(401).json({ success: false, message: "Missing webhook signature." });
  }

  // Ensure rawBody was captured by express.json.verify in server.js
  if (!req.rawBody) {
    console.warn("⚠️ [verifyWebhook] rawBody is missing. Reverting to JSON.stringify (less accurate).");
  }

  const rawBody = req.rawBody || JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    console.warn("⚠️ [verifyWebhook] Invalid Paystack signature — request rejected.");
    return res.status(401).json({ success: false, message: "Invalid webhook signature." });
  }

  next();
};

module.exports = { verifyPaystackWebhook };
