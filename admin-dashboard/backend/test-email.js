require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function run() {
  try {
    const info = await transporter.sendMail({
      from: `"Queens Store Debug" <${process.env.EMAIL_USER}>`,
      to: "badaahjbndszn@gmail.com",
      subject: "Test Email from Local Server!",
      html: "<h2>Success!</h2><p>Your SMTP credentials are working perfectly! The code is flawless!</p>",
    });
    console.log("Email sent! Message ID:", info.messageId);
  } catch (err) {
    console.error("Failed to send:", err.message);
  }
}

run();
