// =====================================================
// utils/emailService.js
// Sends transactional emails via Nodemailer.
// Premium "Queens" styling for order & inventory alerts.
// =====================================================

const nodemailer = require("nodemailer");
const { wrap, THEME } = require("./emailLayout");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === "development" && (!process.env.EMAIL_PASS || process.env.EMAIL_PASS.length < 5)) {
      console.log(`📧 [DEV - email skipped] To: ${to} | Subject: ${subject}`);
      return true;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Queens Store" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    return true;
  } catch (err) {
    console.error(`❌ Email failed:`, err.message);
    return false;
  }
};

// ── Helpers ──────────────

const sendOrderConfirmation = async (order) => {
  const rows = order.items.map((i) => `
    <tr>
      <td>${i.title}</td>
      <td>${i.quantity}</td>
      <td>GH₵${Number(i.price).toLocaleString()}</td>
    </tr>`).join("");

  const body = `
    <h2>Order Received 👋</h2>
    <p>Hi ${order.customerDetails.name}, your order <strong>#${order.orderNumber}</strong> has been confirmed. We're getting it ready for delivery.</p>
    <table class="item-table">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row"><td colspan="2">Total</td><td>GH₵${Number(order.total).toLocaleString()}</td></tr></tfoot>
    </table>
    <div style="text-align: center; margin-top: 30px;">
      <p style="color: ${THEME.muted}; font-size: 13px;">Shipping to: ${order.customerDetails.address || "Main Address"}</p>
    </div>`;

  await sendEmail(order.customerDetails.email, `Order Confirmed: ${order.orderNumber} 🛍️`, wrap("Order Confirmed", body));
};

const sendOrderStatusUpdate = async (order, note) => {
  if (!order.customerDetails.email) return;

  const body = `
    <h2>Order Status: ${order.currentStatus} 📦</h2>
    <p>Great news! Your order <strong>#${order.orderNumber}</strong> has been updated to: <strong>${order.currentStatus}</strong>.</p>
    ${note ? `<div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin: 20px 0;"><p style="margin:0; font-style: italic;">"${note}"</p></div>` : ""}
    ${order.trackingNumber ? `<p style="text-align:center">Tracking Number: <strong style="color: ${THEME.primary}">${order.trackingNumber}</strong></p>` : ""}`;

  await sendEmail(order.customerDetails.email, `Order Update: ${order.orderNumber}`, wrap("Shipping Update", body));
};

const sendLowStockAlert = async (products) => {
  if (!process.env.ADMIN_ALERT_EMAIL) return;

  const rows = products.map((p) => `
    <tr>
      <td>${p.title}</td>
      <td>${p.SKU}</td>
      <td style="color: ${THEME.error}; font-weight: 700;">${p.stockQuantity} Left</td>
    </tr>`).join("");

  const body = `
    <h2 style="color: ${THEME.error}">⚠️ Low Stock Warning</h2>
    <p>The following luxury items are running low. Consider restocking soon to avoid sales interruption.</p>
    <table class="item-table">
      <thead><tr><th>Product</th><th>SKU</th><th>Stock</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  await sendEmail(process.env.ADMIN_ALERT_EMAIL, `Inventory Alert: ${products.length} items low`, wrap("Stock Alert", body, "QUEENS ADMIN"));
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendLowStockAlert,
};