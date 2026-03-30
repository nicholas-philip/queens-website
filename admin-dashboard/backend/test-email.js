require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("Testing SMTP Connection...");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST || "smtp.gmail.com");
console.log("EMAIL_PORT:", process.env.EMAIL_PORT || 587);
console.log("EMAIL_USER config status:", process.env.EMAIL_USER ? "SET" : "MISSING");
console.log("EMAIL_PASS config status:", process.env.EMAIL_PASS ? "SET" : "MISSING");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("\n❌ SMTP CONNECTION FAILED:");
    console.log(error.message);
  } else {
    console.log("\n✅ SMTP Connection SUCCESSFUL! Credentials are correct.");
  }
});
