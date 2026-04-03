const axios = require("axios");

/**
 * Paystack Service
 * Handles interaction with Paystack API for Mobile Money & Card payments.
 */
class PaystackService {
  constructor() {
    this.secretKey = (process.env.PAYSTACK_SECRET_KEY || "").trim();
    this.baseUrl   = "https://api.paystack.co";
  }

  /**
   * Initialize a transaction
   * @param {Object} data { email, amount, orderId, metadata }
   * @returns {Promise<Object>} { authorization_url, access_code, reference }
   */
  async initializeTransaction(data) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email:    data.email,
          amount:   Math.round(data.amount * 100), // convert to kobo/pesewas
          reference: `QNS-${data.orderId}-${Date.now()}`,
          callback_url: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/payment/verify",
          metadata: {
            orderId: data.orderId,
            ...data.metadata
          },
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("❌ Paystack Init Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Payment initialization failed");
    }
  }

  /**
   * Verify a transaction
   * @param {string} reference
   */
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("❌ Paystack Verify Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Payment verification failed");
    }
  }
}

module.exports = new PaystackService();
