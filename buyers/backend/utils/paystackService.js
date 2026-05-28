// =====================================================
// utils/paystackService.js
// Paystack Ghana — Card, Mobile Money, Bank
// Currency: GHS (Ghana Cedis)
// Paystack converts amount to pesewas (x100)
// =====================================================

const axios = require("axios");
const crypto = require("crypto");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = "https://api.paystack.co";

const paystackAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

// ── Initialize a transaction ─────────────────────────
// channel: "card" | "mobile_money" | "bank"
// mobileProvider (for mobile_money): "mtn" | "tcl" | "atl"
const initializeTransaction = async ({ email, amount, reference, metadata = {}, channel = "card", mobileProvider = null, callbackUrl }) => {
  const payload = {
    email,
    amount: Math.round(amount * 100),   // Paystack uses pesewas
    currency: "GHS",
    reference,
    callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
    metadata,
  };

  if (channel && channel !== "all") {
    payload.channels = [channel];
  } else {
    payload.channels = ["card", "mobile_money"];
  }

  // Mobile Money requires provider
  if (channel === "mobile_money" && mobileProvider) {
    payload.mobile_money = { phone: metadata.phone, provider: mobileProvider };
  }

  const { data } = await paystackAPI.post("/transaction/initialize", payload);
  return data.data; // { authorization_url, access_code, reference }
};

// ── Verify a transaction ─────────────────────────────
const verifyTransaction = async (reference) => {
  const { data } = await paystackAPI.get(`/transaction/verify/${reference}`);
  return data.data; // { status, amount, currency, channel, customer, ... }
};

// ── Verify Paystack webhook signature ───────────────
const verifyWebhookSignature = (rawBody, paystackSignature) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === paystackSignature;
};

module.exports = { initializeTransaction, verifyTransaction, verifyWebhookSignature };
