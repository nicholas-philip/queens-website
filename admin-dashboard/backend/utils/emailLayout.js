// =====================================================
// utils/emailLayout.js
//
// Shared HTML wrapper for all transactional emails.
// Premium "Queens" aesthetic (Gold/Dark theme).
// =====================================================

const THEME = {
  bg:      "#0c0c0c", // dark background
  card:    "#171717", // darker card
  primary: "#d4a017", // gold
  text:    "#e5e5e5", // off-white text
  muted:   "#71717a", // grey text
  success: "#22c55e",
  error:   "#ef4444",
};

const wrap = (title, body, headerTitle = "QUEENS 👑") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f3f4f6; padding: 40px 10px; }
    .container { max-width: 560px; margin: 0 auto; background-color: ${THEME.bg}; border-radius: 20px; overflow: hidden; border: 1px solid #262626; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .header { padding: 40px 30px; text-align: center; background: linear-gradient(135deg, ${THEME.bg} 0%, #1a1a1a 100%); position: relative; }
    .header h1 { color: #fff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .gold-bar { height: 2px; width: 60px; background: linear-gradient(90deg, transparent, ${THEME.primary}, transparent); margin: 15px auto 0; }
    .body { padding: 40px; }
    .body h2 { font-size: 20px; color: #fff; margin-bottom: 24px; font-weight: 700; text-align: center; }
    .body p { font-size: 15px; color: ${THEME.text}; line-height: 1.65; margin-bottom: 24px; }
    .footer { padding: 30px; text-align: center; border-top: 1px solid #262626; background-color: #0a0a0a; }
    .footer p { font-size: 12px; color: ${THEME.muted}; margin: 4px 0; line-height: 1.5; }
    /* Table styles for items */
    .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .item-table th { text-align: left; color: ${THEME.muted}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; padding: 12px 8px; }
    .item-table td { color: ${THEME.text}; font-size: 14px; padding: 12px 8px; border-bottom: 1px solid #262626; }
    .total-row td { font-weight: 700; color: ${THEME.primary}; font-size: 18px; border-top: 2px solid #333; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, ${THEME.primary} 0%, #b8860b 100%);
      color: #000 !important;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headerTitle}</h1>
      <div class="gold-bar"></div>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>Luxury Fashion Store — Admin Portal</p>
      <p>© ${new Date().getFullYear()} Queens Dashboard. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

module.exports = { wrap, THEME };
