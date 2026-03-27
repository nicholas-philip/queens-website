// =====================================================
// middleware/emailService.js
// Final production transactional emails.
// =====================================================

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log(`📧 [DEV_MODE] Email Intercepted: To: ${to} | Subject: ${subject}`);
      return true;
    }
    if (!process.env.EMAIL_USER) return false;
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("❌ [EMAIL] Send failed:", err.message);
    return false;
  }
};

const goldWrapper = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/>
<style>
  body { font-family: Georgia, serif; background: #000; margin: 0; padding: 20px; }
  .box { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .head { background: #111; padding: 30px; text-align: center; color: #c9a96e; }
  .brand { font-size: 20px; font-weight: bold; letter-spacing: 2px; }
  .content { padding: 30px; font-size: 14px; line-height: 1.6; color: #333; }
  .btn { display: inline-block; background: #c9a96e; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; }
  .foot { padding: 20px; font-size: 10px; color: #999; text-align: center; background: #f9f9f9; }
</style>
</head>
<body>
  <div class="box">
    <div class="head"><div class="brand">✦ Queens Storefront ✦</div></div>
    <div class="content">${body}</div>
    <div class="foot">© ${new Date().getFullYear()} Queens Cosmetics. Professional Beauty.</div>
  </div>
</body>
</html>`;

const sendOrderConfirmation = async (order) => {
  if (!order.customerDetails.email) return;
  const html = goldWrapper("Order Confirmed", `
    <h2>Order Confirmed! 💄</h2>
    <p>Hi ${order.customerDetails.name}, your order <b>${order.orderNumber}</b> has been received and 
    is being carefully prepared.</p>
    <p><b>Total:</b> GHS ${order.total.toLocaleString()}</p>
    <p>We'll notify you as soon as it ships!</p>
  `);
  await sendEmail(order.customerDetails.email, `Order Success: ${order.orderNumber} ✨`, html);
};

const sendStatusUpdate = async (order) => {
  if (!order.customerDetails.email) return;
  const html = goldWrapper("Status Update", `
    <h2>Order Update 🚚</h2>
    <p>Your order <b>${order.orderNumber}</b> status is now: <b>${order.currentStatus}</b>.</p>
  `);
  await sendEmail(order.customerDetails.email, `Status Update: ${order.orderNumber} | ${order.currentStatus}`, html);
};

const sendNewsletterWelcome = async (email, firstName) => {
  const html = goldWrapper("Welcome", `
    <h2>Welcome Beauty! 💋</h2>
    <p>Hi ${firstName || ""}, thanks for joining our newsletter. Get 10% off your first luxury order with code: <b>QUEEN10</b></p>
  `);
  await sendEmail(email, "Welcome to the Queens Family 👑", html);
};

const sendContactConfirmation = async (name, email) => {
  const html = goldWrapper("Received", `
    <h2>Message Received!</h2>
    <p>Thanks ${name}, we've received your inquiry and our team will be in touch within 24 hours.</p>
  `);
  await sendEmail(email, "Message Received — Queens Cosmetics", html);
};

module.exports = { 
  sendEmail, 
  sendOrderConfirmation, 
  sendStatusUpdate, 
  sendNewsletterWelcome, 
  sendContactConfirmation 
};