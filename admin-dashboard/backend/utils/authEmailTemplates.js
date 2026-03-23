// =====================================================
// utils/authEmailTemplates.js
//
// HTML email templates for all admin auth flows:
//   1. verifyEmailTemplate    → confirm email address
//   2. passwordResetTemplate  → reset forgotten password
//   3. welcomeTemplate        → after email is verified
//   4. passwordChangedTemplate → security alert after reset
//   5. newAdminInviteTemplate → when SuperAdmin creates a new admin
// =====================================================

// Shared wrapper — keeps all emails consistent
const wrap = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 32px 16px; }
    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #18181b; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .header p  { color: #a1a1aa; font-size: 12px; margin-top: 4px; }
    .body { padding: 32px; }
    .body h2 { font-size: 18px; color: #18181b; margin-bottom: 12px; }
    .body p  { font-size: 14px; color: #52525b; line-height: 1.7; margin-bottom: 12px; }
    .btn {
      display: block; width: fit-content;
      background: #18181b; color: #fff !important;
      text-decoration: none; padding: 14px 32px;
      border-radius: 8px; font-size: 14px; font-weight: 600;
      margin: 24px auto; text-align: center;
    }
    .info { background: #f4f4f5; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #3f3f46; }
    .info strong { color: #18181b; }
    .warning { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #9a3412; margin: 16px 0; }
    .success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #15803d; margin: 16px 0; }
    .divider { height: 1px; background: #f4f4f5; margin: 20px 0; }
    .footer { background: #f4f4f5; padding: 16px 32px; text-align: center; font-size: 11px; color: #a1a1aa; }
    .code { font-family: monospace; background: #f4f4f5; padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #18181b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🛍️ Admin Dashboard</h1>
      <p>Secure Admin Portal</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>This email was sent automatically. Do not reply.</p>
      <p style="margin-top:4px">© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;


// ─────────────────────────────────────────────────
// 1. EMAIL VERIFICATION
// Sent when a new admin registers.
// They must click the link to activate their account.
//
// verificationUrl example:
//   http://localhost:3000/verify-email?token=abc123def456
// ─────────────────────────────────────────────────
const verifyEmailTemplate = (adminName, verificationUrl, plainCode) => ({
  subject: "Verify your admin email address",
  html: wrap("Verify Your Email", `
    <h2>Welcome, ${adminName}! 👋</h2>
    <p>Your admin account has been created. Before you can log in,
    you need to verify your email address.</p>

    <div class="info" style="text-align:center">
      <strong>Your Verification Code:</strong><br>
      <span style="font-size:32px; font-weight:700; color:#18181b; letter-spacing:4px; margin:12px 0; display:block">${plainCode || "------"}</span>
    </div>

    <p>Or click the button below to verify automatically:</p>

    <a href="${verificationUrl}" class="btn">✅ Verify Email Address</a>

    <div class="info">
      <strong>Link expires in:</strong> 24 hours<br>
      <strong>If the button doesn't work</strong>, copy this link into your browser:<br>
      <span style="word-break:break-all; color:#6366f1">${verificationUrl}</span>
    </div>

    <div class="warning">
      If you did not create an admin account, please ignore this email and contact your SuperAdmin immediately.
    </div>
  `),
});


// ─────────────────────────────────────────────────
// 2. FORGOT PASSWORD / RESET LINK
// Sent when admin clicks "Forgot password".
// The link expires in 1 hour.
//
// resetUrl example:
//   http://localhost:3000/reset-password?token=xyz789abc
// ─────────────────────────────────────────────────
const passwordResetTemplate = (adminName, resetUrl, plainCode) => ({
  subject: "Reset your admin password",
  html: wrap("Password Reset Request", `
    <h2>Password Reset</h2>
    <p>Hi <strong>${adminName}</strong>,</p>
    <p>We received a request to reset the password for your admin account.
    You can use the numeric code below or the button to set a new password.</p>

    <div class="info" style="text-align:center">
      <strong>Your Reset Code:</strong><br>
      <span style="font-size:32px; font-weight:700; color:#18181b; letter-spacing:4px; margin:12px 0; display:block">${plainCode || "------"}</span>
    </div>

    <p>Or click the button below to reset automatically:</p>

    <a href="${resetUrl}" class="btn">🔑 Reset My Password</a>

    <div class="warning">
      <strong>⏱ This link and code expire in 1 hour.</strong><br>
      If you did not request a password reset, you can safely ignore this email.
      Your password will not change.
    </div>

    <div class="info">
      <strong>If the button doesn't work</strong>, copy this link into your browser:<br>
      <span style="word-break:break-all; color:#6366f1">${resetUrl}</span>
    </div>

    <div class="divider"></div>
    <p style="font-size:12px; color:#a1a1aa">
      For security, this link can only be used once and expires in 60 minutes.
    </p>
  `),
});


// ─────────────────────────────────────────────────
// 3. WELCOME EMAIL
// Sent after admin successfully verifies their email.
// ─────────────────────────────────────────────────
const welcomeTemplate = (adminName, loginUrl) => ({
  subject: "Your admin account is ready 🎉",
  html: wrap("Account Verified!", `
    <div class="success">
      <strong>✅ Email verified successfully!</strong><br>
      Your admin account is now fully activated.
    </div>

    <h2>You're all set, ${adminName}!</h2>
    <p>Your admin account has been verified and you can now log in to the dashboard.</p>

    <a href="${loginUrl}" class="btn">🚀 Go to Admin Dashboard</a>

    <div class="info">
      <strong>Your role:</strong> Manager (contact SuperAdmin to change)<br>
      <strong>Dashboard:</strong> <span style="color:#6366f1">${loginUrl}</span>
    </div>

    <p style="font-size:13px; color:#71717a">
      Keep your login credentials safe and never share your password with anyone.
    </p>
  `),
});


// ─────────────────────────────────────────────────
// 4. PASSWORD CHANGED ALERT
// Sent after a successful password reset.
// Security notification so admin knows their password changed.
// ─────────────────────────────────────────────────
const passwordChangedTemplate = (adminName) => ({
  subject: "Your admin password has been changed",
  html: wrap("Password Changed", `
    <h2>Password Updated</h2>
    <p>Hi <strong>${adminName}</strong>,</p>
    <p>Your admin dashboard password was successfully changed.</p>

    <div class="success">
      <strong>✅ Password reset successful.</strong><br>
      You can now log in with your new password.
    </div>

    <div class="warning">
      <strong>⚠️ If you did NOT change your password</strong>, your account may be compromised.
      Contact your SuperAdmin immediately and reset your password again.
    </div>

    <div class="info">
      <strong>Time of change:</strong> ${new Date().toUTCString()}<br>
      <strong>Action:</strong> If this was not you, contact your admin right away.
    </div>
  `),
});


// ─────────────────────────────────────────────────
// 5. NEW ADMIN INVITE
// Sent when a SuperAdmin creates a new admin account.
// Contains their temporary credentials + verify link.
//
// Used in adminController → createAdmin()
// ─────────────────────────────────────────────────
const newAdminInviteTemplate = (newAdminName, inviterName, tempPassword, verificationUrl, plainCode) => ({
  subject: `You've been added as an admin`,
  html: wrap("Admin Invitation", `
    <h2>You've been invited! 🎉</h2>
    <p>Hi <strong>${newAdminName}</strong>,</p>
    <p><strong>${inviterName}</strong> has added you as an admin on the dashboard.
    Here are your temporary login credentials:</p>

    <div class="info">
      <strong>Temporary Password:</strong>
      <span class="code">${tempPassword}</span><br><br>
      <strong>Verification Code:</strong>
      <span style="font-family:monospace; font-weight:700">${plainCode || "------"}</span>
      <br><br>
      <strong>Important:</strong> You must verify your email and change this password after logging in.
    </div>

    <p>First, click below to verify your email address:</p>
    <a href="${verificationUrl}" class="btn">✅ Verify Email & Activate Account</a>

    <div class="warning">
      For security, please change your password immediately after your first login.
      This temporary password should not be kept.
    </div>
  `),
});


module.exports = {
  verifyEmailTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  passwordChangedTemplate,
  newAdminInviteTemplate,
};