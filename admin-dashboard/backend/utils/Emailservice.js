// =====================================================
// utils/Emailservice.js
// Sends all transactional emails via Nodemailer.
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

// ── Core send function ────────────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    // Skip sending emails in dev if EMAIL_PASS not configured
    if (
      process.env.NODE_ENV !== "production" &&
      (!process.env.EMAIL_PASS || process.env.EMAIL_PASS.length < 5)
    ) {
      console.log(`📧 [DEV — skipped] To: ${to} | Subject: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Queens Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error(`❌  Email failed [${subject}]:`, err.message);
    return false;
  }
};

// ── Order confirmation ────────────────────────────
const sendOrderConfirmation = async (order) => {
  if (!order.customerDetails?.email) return;

  const rows = order.items
    .map(
      (i) => `
    <tr>
      <td>${i.title}</td>
      <td>${i.quantity}</td>
      <td>GH₵${Number(i.price).toLocaleString()}</td>
      <td>GH₵${Number(i.lineTotal).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const addr = order.customerDetails.address;
  const addrLine = addr
    ? `${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}`
    : "—";

  const body = `
    <h2>Order Confirmed 🛍️</h2>
    <p>Hi <strong>${order.customerDetails.name}</strong>, your order <strong>${order.orderNumber}</strong> has been received and we're preparing it.</p>
    <table class="item-table">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="total-row"><td colspan="3">Order Total</td><td>GH₵${Number(order.total).toLocaleString()}</td></tr>
      </tfoot>
    </table>
    <p style="text-align:center; color:${THEME.muted}; font-size:13px; margin-top:20px;">
      Shipping to: ${addrLine}
    </p>`;

  await sendEmail(
    order.customerDetails.email,
    `Order Confirmed: ${order.orderNumber} 🛍️`,
    wrap("Order Confirmed", body)
  );
};

// ── Order status update ───────────────────────────
const sendOrderStatusUpdate = async (order, note) => {
  if (!order.customerDetails?.email) return;

  const body = `
    <h2>Order Update: ${order.currentStatus} 📦</h2>
    <p>Your order <strong>${order.orderNumber}</strong> has been updated to: <strong>${order.currentStatus}</strong>.</p>
    ${note ? `<div style="background-color:rgba(255,255,255,0.03);padding:20px;border-radius:12px;margin:20px 0;"><p style="margin:0;font-style:italic;">"${note}"</p></div>` : ""}
    ${order.trackingNumber ? `<p style="text-align:center">Tracking: <strong style="color:${THEME.primary}">${order.trackingNumber}</strong>${order.carrier ? ` via ${order.carrier}` : ""}</p>` : ""}`;

  await sendEmail(
    order.customerDetails.email,
    `Order Update: ${order.orderNumber}`,
    wrap("Shipping Update", body)
  );
};

// ── Refund confirmation ───────────────────────────
const sendRefundConfirmation = async (order, transaction, reason) => {
  if (!order.customerDetails?.email) return;

  const body = `
    <h2>Refund Processed 💰</h2>
    <p>Hi <strong>${order.customerDetails.name}</strong>, your refund for order <strong>${order.orderNumber}</strong> has been successfully processed.</p>
    <div style="background-color: rgba(34,197,94,0.1); border: 1px solid ${THEME.success}; padding: 24px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <span style="font-size: 13px; color: ${THEME.muted}; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</span>
      <p style="font-size: 32px; font-weight: 800; color: ${THEME.success}; margin: 8px 0;">GH₵${Number(transaction.amount).toLocaleString()}</p>
    </div>
    ${reason ? `<p style="text-align:center;color:${THEME.muted};font-size:13px;">Reason: ${reason}</p>` : ""}
    <p style="text-align:center;font-size:13px;color:${THEME.muted};">Please allow 3–5 business days for the refund to appear in your account.</p>`;

  await sendEmail(
    order.customerDetails.email,
    `Refund Confirmed: ${order.orderNumber}`,
    wrap("Refund Confirmed", body)
  );
};

// ── Low stock alert (to admin) ────────────────────
const sendLowStockAlert = async (products) => {
  if (!process.env.ADMIN_ALERT_EMAIL || !products.length) return;

  const rows = products
    .map(
      (p) => `
    <tr>
      <td>${p.title}</td>
      <td>${p.SKU}</td>
      <td style="color:${THEME.error};font-weight:700;">${p.stockQuantity} left</td>
    </tr>`
    )
    .join("");

  const body = `
    <h2 style="color:${THEME.error}">⚠️ Low Stock Warning</h2>
    <p>${products.length} item(s) are running low. Restock soon to avoid sales interruption.</p>
    <table class="item-table">
      <thead><tr><th>Product</th><th>SKU</th><th>Stock</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  await sendEmail(
    process.env.ADMIN_ALERT_EMAIL,
    `Inventory Alert: ${products.length} items low`,
    wrap("Stock Alert", body, "QUEENS ADMIN")
  );
};

// ── Review reply notification ─────────────────────
const sendReviewReplyEmail = async (review, product, replyText) => {
  if (!review.customerEmail) return;

  const body = `
    <div style="text-align:center; margin-bottom:30px;">
      <div style="width:64px; height:64px; background:rgba(212,160,23,0.1); border-radius:16px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <span style="font-size:32px;">👑</span>
      </div>
      <h2 style="margin:0; font-size:24px; letter-spacing:-0.5px;">Official Reply Received</h2>
      <p style="color:${THEME.muted}; font-size:14px; margin-top:8px;">Queens has responded to your review</p>
    </div>

    <div style="background-color:rgba(255,255,255,0.03); border:1px solid #262626; border-radius:20px; padding:30px; margin-bottom:30px;">
      <p style="color:${THEME.muted}; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Your Review of "${product.title}"</p>
      <p style="font-style:italic; border-left:3px solid ${THEME.primary}; padding-left:20px; margin-bottom:24px; color:${THEME.text};">
        "${review.comment}"
      </p>
      
      <div style="height:1px; background:#262626; margin-bottom:24px;"></div>
      
      <p style="color:${THEME.primary}; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; font-weight:bold;">Queens Response</p>
      <p style="margin:0; color:#fff; font-size:16px; line-height:1.6;">
        ${replyText}
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/product/${product.slug || product._id}" class="btn">View Product Details</a>
    </div>
  `;

  await sendEmail(
    review.customerEmail,
    `New Reply to your review of ${product.title} ✨`,
    wrap("Official Reply", body)
  );
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendStatusUpdate: sendOrderStatusUpdate, // alias to match buyer backend naming
  sendRefundConfirmation,
  sendLowStockAlert,
  sendReviewReplyEmail,
};