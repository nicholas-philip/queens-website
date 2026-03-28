// =====================================================
// utils/authEmailTemplates.js
//
// HTML email templates for all admin auth flows.
// Uses shared layout from emailLayout.js.
// =====================================================

const { wrap, THEME } = require("./emailLayout");

// ── 1. EMAIL VERIFICATION ─────────────────────────
const verifyEmailTemplate = (adminName, verificationUrl, plainCode) => ({
  subject: "Queens: Verify your admin email address",
  html: wrap("Verify Your Email", `
    <h2>Welcome to Queens, ${adminName}! 👋</h2>
    <p style="text-align:center">Your admin account is almost ready. Verify your email to unlock the dashboard.</p>
    <div style="background-color: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 16px; padding: 24px; margin: 30px 0; text-align: center;">
      <span style="font-size: 13px; color: ${THEME.muted}; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Verification Code</span>
      <span style="font-size: 36px; font-weight: 800; color: ${THEME.primary}; letter-spacing: 8px; margin: 12px 0; display: block;">${plainCode || "------"}</span>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <p style="margin-bottom: 20px;">Or click the button for instant verification:</p>
      <a href="${verificationUrl}" class="btn">Confirm My Identity</a>
    </div>
    <p style="font-size: 13px; color: ${THEME.muted}; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; text-align:center;">
      Link expires in 24 hours.
    </p>
  `),
});

// ── 2. FORGOT PASSWORD ────────────────────────────
const passwordResetTemplate = (adminName, resetUrl, plainCode) => ({
  subject: "Queens: Reset your admin password",
  html: wrap("Password Reset Request", `
    <h2>Password Reset Requested 🔐</h2>
    <p style="text-align:center">We received a request to reset the password for <strong>${adminName}</strong>.</p>
    <div style="background-color: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 16px; padding: 24px; margin: 30px 0; text-align: center;">
      <span style="font-size: 13px; color: ${THEME.muted}; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Reset Code</span>
      <span style="font-size: 36px; font-weight: 800; color: ${THEME.primary}; letter-spacing: 8px; margin: 12px 0; display: block;">${plainCode || "------"}</span>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <p style="margin-bottom: 20px;">Or use this secure reset button:</p>
      <a href="${resetUrl}" class="btn">Update My Password</a>
    </div>
    <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid ${THEME.error}; padding: 15px; border-radius: 8px; margin-top: 30px;">
      <p style="color: ${THEME.error}; font-size: 13px; margin-bottom: 0; font-weight: 600;">⚠️ Security Notice</p>
      <p style="color: ${THEME.error}; font-size: 12px; margin-bottom: 0;">This request expires in 60 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `),
});

// ── 3. WELCOME (post-verification) ───────────────
const welcomeTemplate = (adminName, loginUrl) => ({
  subject: "Queens: Your admin account is active 🎉",
  html: wrap("Account Verified!", `
    <div style="text-align: center;">
       <div style="background-color: rgba(34,197,94,0.1); border: 1px solid ${THEME.success}; padding: 12px 24px; border-radius: 40px; display: inline-block; margin-bottom: 20px;">
          <span style="color: ${THEME.success}; font-size: 14px; font-weight: 600;">✓ Email Verified Successfully</span>
       </div>
    </div>
    <h2 style="text-align:center">Ready to launch, ${adminName}! 🚀</h2>
    <p style="text-align:center">Your admin account is activated. You can now access all management tools.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="btn">Launch Dashboard</a>
    </div>
  `),
});

// ── 4. PASSWORD CHANGED ALERT ─────────────────────
const passwordChangedTemplate = (adminName) => ({
  subject: "Queens Security Alert: Password Changed",
  html: wrap("Password Changed", `
    <h2 style="text-align:center">Security Alert 🛡️</h2>
    <p style="text-align:center">Hi ${adminName}, the password for your Queens admin account was successfully updated.</p>
    <div style="background-color: rgba(34,197,94,0.1); border: 1px solid ${THEME.success}; padding: 20px; border-radius: 16px; margin: 30px 0; text-align: center;">
      <p style="color: ${THEME.success}; font-size: 15px; font-weight: 600; margin-bottom: 0;">✓ Password Updated</p>
    </div>
    <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid ${THEME.error}; padding: 15px; border-radius: 8px; margin-top: 30px;">
      <p style="color: ${THEME.error}; font-size: 13px; margin-bottom: 0; font-weight: 600;">⚠️ Not you?</p>
      <p style="color: ${THEME.error}; font-size: 12px; margin-bottom: 0;">Contact your SuperAdmin immediately.</p>
    </div>
  `),
});

// ── 5. NEW ADMIN INVITATION ───────────────────────
const newAdminInviteTemplate = (adminName, inviterName, tempPassword, loginUrl) => ({
  subject: "You've been invited to Queens Admin Dashboard",
  html: wrap("Admin Invitation 👑", `
    <h2>Welcome to the Team, ${adminName}!</h2>
    <p style="text-align:center">
      <strong>${inviterName}</strong> has added you as an admin on the Queens Dashboard.
      Your account is already active and you can sign in immediately with the credentials below:
    </p>
    <div style="background-color: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 20px; padding: 24px; margin: 30px 0;">
      <p style="margin-bottom: 8px; color: ${THEME.muted}; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; text-align:center;">Temporary Password</p>
      <p style="font-size: 24px; font-weight: 800; color: ${THEME.primary}; letter-spacing: 4px; margin: 0; text-align:center;">${tempPassword}</p>
      <p style="font-size: 11px; color: ${THEME.muted}; margin-top: 16px; text-align:center;">Important: Change your password from Settings as soon as you log in.</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="btn">Launch Dashboard &amp; Log In</a>
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