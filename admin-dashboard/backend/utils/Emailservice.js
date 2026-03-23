// =====================================================
// utils/emailService.js
// Sends transactional emails via Nodemailer.
// Skips sending in development mode — just logs.
// All functions return true/false, never throw.
// =====================================================

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Core send function — all helpers below call this
const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 [DEV - email skipped] To: ${to} | Subject: ${subject}`);
      return true;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing. Skipping.");
      return false;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Your Store" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`✅ Email sent → ${to}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed → ${to}:`, err.message);
    return false;
  }
};

// ── Helpers called from controllers ──────────────

// New order — sends confirmation to customer + alert to admin
const sendOrderConfirmation = async (order) => {
  const items = order.items.map((i) =>
    `<tr><td>${i.title}</td><td>${i.SKU}</td><td>${i.quantity}</td><td>₦${Number(i.price).toLocaleString()}</td></tr>`
  ).join("");

  const customerHtml = `
    <h2>Order Confirmed — ${order.orderNumber}</h2>
    <p>Hi <strong>${order.customerDetails.name}</strong>, your order has been received!</p>
    <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
      <tr><th>Item</th><th>SKU</th><th>Qty</th><th>Price</th></tr>${items}
    </table>
    <p><strong>Total: ₦${Number(order.total).toLocaleString()}</strong></p>
    <p>We'll update you when your order ships.</p>`;

  const adminHtml = `
    <h2>🛒 New Order: ${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${order.customerDetails.name}</p>
    <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
    <p><strong>Total:</strong> ₦${Number(order.total).toLocaleString()}</p>`;

  if (order.customerDetails.email) {
    await sendEmail(order.customerDetails.email, `Order Confirmed ✅ — ${order.orderNumber}`, customerHtml);
  }
  if (process.env.ADMIN_ALERT_EMAIL) {
    await sendEmail(process.env.ADMIN_ALERT_EMAIL, `🆕 New Order ${order.orderNumber}`, adminHtml);
  }
};

// Status update — sent to customer
const sendOrderStatusUpdate = async (order, note) => {
  if (!order.customerDetails.email) return;
  const html = `
    <h2>Order Update — ${order.orderNumber}</h2>
    <p>Your order status is now: <strong>${order.currentStatus}</strong></p>
    ${note ? `<p>Note: ${note}</p>` : ""}
    ${order.trackingNumber ? `<p>Tracking: <strong>${order.trackingNumber}</strong></p>` : ""}`;
  await sendEmail(order.customerDetails.email, `Order ${order.currentStatus} — ${order.orderNumber}`, html);
};

// Refund confirmation — sent to customer
const sendRefundConfirmation = async (order, transaction, reason) => {
  if (!order.customerDetails.email) return;
  const html = `
    <h2>Refund Processed — ${order.orderNumber}</h2>
    <p>Hi ${order.customerDetails.name}, your refund of <strong>₦${Number(transaction.amount).toLocaleString()}</strong> has been processed.</p>
    <p>Reason: ${reason || "Requested by admin"}</p>
    <p>Please allow 5–10 business days to appear in your account.</p>`;
  await sendEmail(order.customerDetails.email, `Refund Confirmed — ${order.orderNumber}`, html);
};

// Low stock alert — sent to admin
const sendLowStockAlert = async (products) => {
  if (!process.env.ADMIN_ALERT_EMAIL || !products.length) return;
  const rows = products.map((p) =>
    `<tr><td>${p.title}</td><td>${p.SKU}</td><td style="color:red">${p.stockQuantity}</td></tr>`
  ).join("");
  const html = `
    <h2>⚠️ Low Stock Alert</h2>
    <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
      <tr><th>Product</th><th>SKU</th><th>Stock Left</th></tr>${rows}
    </table>`;
  await sendEmail(process.env.ADMIN_ALERT_EMAIL, `⚠️ Low Stock — ${products.length} products`, html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendRefundConfirmation,
  sendLowStockAlert,
};