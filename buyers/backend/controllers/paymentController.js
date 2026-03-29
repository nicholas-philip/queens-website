// =====================================================
// controllers/paymentController.js
// Paystack Ghana — Card, Mobile Money (MTN/Telecel/AirtelTigo), Bank
// POST /api/payment/initialize  — frontend calls this before redirect
// POST /api/payment/webhook     — Paystack calls this after payment
// GET  /api/payment/verify/:ref — optional manual verify
// =====================================================

const { v4: uuidv4 } = require("uuid");
const Order        = require("../models/Order");
const Transaction  = require("../models/Transaction");
const Invoice      = require("../models/Invoice");
const Notification = require("../models/Notification");
const { sendOrderConfirmation, sendStatusUpdate } = require("../utils/emailService");
const { initializeTransaction, verifyTransaction } = require("../utils/paystackService");

// ── POST /api/payment/initialize ────────────────────
// Frontend sends: { orderId, channel, mobileProvider? }
// Returns:        { authorization_url, reference }
const initializePayment = async (req, res) => {
  try {
    const { orderId, channel = "card", mobileProvider } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required." });
    }

    // Validate channel
    const validChannels = ["card", "mobile_money", "bank"];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid channel. Choose: ${validChannels.join(", ")}`,
      });
    }

    // Validate mobile money provider
    if (channel === "mobile_money") {
      const validProviders = ["mtn", "tcl", "atl"];
      if (!mobileProvider || !validProviders.includes(mobileProvider)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile money requires provider: "mtn" (MTN), "tcl" (Telecel), or "atl" (AirtelTigo)',
        });
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Order has already been paid." });
    }

    const reference = `QNS-${uuidv4().replace(/-/g, "").substring(0, 16).toUpperCase()}`;

    const paystackData = await initializeTransaction({
      email:          order.customerDetails.email || "customer@queens.shop",
      amount:         order.total,              // GHS — service converts to pesewas
      reference,
      channel,
      mobileProvider,
      callbackUrl:    `${process.env.FRONTEND_URL}/payment/success?ref=${reference}`,
      metadata: {
        orderId:      order._id.toString(),
        orderNumber:  order.orderNumber,
        customerName: order.customerDetails.name,
        phone:        order.customerDetails.phone || "",
        channel,
        mobileProvider: mobileProvider || null,
      },
    });

    // Save reference on the order so webhook can match it
    order.paystackReference = reference;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment initialized.",
      authorization_url: paystackData.authorization_url,
      access_code:       paystackData.access_code,
      reference,
      channel,
      amount: order.total,
      currency: "GHS",
    });
  } catch (err) {
    console.error("❌ [Payment Init]", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Payment initialization failed.", error: err.message });
  }
};

// ── POST /api/payment/webhook ────────────────────────
// Called by Paystack after payment. MUST be raw body for signature check.
const handleWebhook = async (req, res) => {
  const event = req.body;

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return res.status(200).json({ received: true }); // Acknowledge other events
  }

  const { reference, amount, channel, customer, metadata, status } = event.data;

  try {
    // Prevent duplicate processing
    const alreadyDone = await Transaction.findOne({ transactionId: reference });
    if (alreadyDone) {
      return res.status(200).json({ received: true, note: "Already processed." });
    }

    // Find the order
    const order = await Order.findById(metadata.orderId);
    if (!order) {
      console.error("❌ Webhook: Order not found for ref:", reference);
      return res.status(200).json({ received: true }); // Still 200 to stop retries
    }

    // Record transaction
    await Transaction.create({
      transactionId:   reference,
      orderRef:        order._id,
      paymentMethod:   formatChannel(channel),
      amount:          amount / 100,   // Convert pesewas → GHS
      currency:        "GHS",
      status:          "Success",
      customerName:    customer.first_name ? `${customer.first_name} ${customer.last_name}` : metadata.customerName,
      customerEmail:   customer.email,
      gatewayResponse: { channel, authorization_code: event.data.authorization?.authorization_code || "" },
    });

    // Update order
    order.paymentStatus  = "Paid";
    order.currentStatus  = "Processing";
    order.statusHistory.push({
      status:    "Processing",
      note:      `GHS ${(amount / 100).toFixed(2)} confirmed via ${formatChannel(channel)}`,
      changedAt: new Date(),
    });
    await order.save();

    // Mark invoice paid
    await Invoice.findOneAndUpdate({ orderRef: order._id }, { status: "Paid" });

    // Admin notification
    await Notification.push(
      "PAYMENT_RECEIVED",
      `Payment Received — ${order.orderNumber}`,
      `GHS ${(amount / 100).toLocaleString()} via ${formatChannel(channel)} from ${metadata.customerName}`,
      `/admin/orders/${order._id}`
    );

    // Email confirmation
    await sendStatusUpdate(order);

    console.log(`✅ [Webhook] Payment confirmed: ${reference} | GHS ${amount / 100} | ${channel}`);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ [Webhook Error]", err.message);
    res.status(500).json({ success: false, message: "Webhook processing error." });
  }
};

// ── GET /api/payment/verify/:reference ──────────────
// Frontend can call this on the success/callback page
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const data = await verifyTransaction(reference);

    if (data.status !== "success") {
      return res.status(400).json({ success: false, message: "Payment not successful.", status: data.status });
    }

    const order = await Order.findOne({ paystackReference: reference })
      .select("orderNumber currentStatus paymentStatus total customerDetails.name");

    res.status(200).json({
      success:       true,
      message:       "Payment verified successfully.",
      reference,
      amount:        data.amount / 100,
      currency:      "GHS",
      channel:       data.channel,
      paidAt:        data.paid_at,
      order: order ? {
        orderNumber:   order.orderNumber,
        status:        order.currentStatus,
        paymentStatus: order.paymentStatus,
        total:         order.total,
        customerName:  order.customerDetails.name,
      } : null,
    });
  } catch (err) {
    console.error("❌ [Verify Payment]", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Payment verification failed.", error: err.message });
  }
};

// ── Helper ───────────────────────────────────────────
const formatChannel = (channel) => {
  const map = {
    card:         "Card",
    mobile_money: "Mobile Money",
    bank:         "Bank Transfer",
  };
  return map[channel] || channel;
};

module.exports = { initializePayment, handleWebhook, verifyPayment };
