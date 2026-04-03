// =====================================================
// cron.js
// Render Keep-Alive Script
// =====================================================
const https = require('https');

const startKeepAlive = () => {
  // Render automatically injects an environment variable called 
  // RENDER_EXTERNAL_URL (e.g., https://your-app.onrender.com)
  const url = process.env.RENDER_EXTERNAL_URL;

  if (!url) {
    console.log('⏳ [CRON] Keep-Alive disabled: RENDER_EXTERNAL_URL not found (likely running locally).');
    return;
  }

  console.log(`⏱️ [CRON] Render Keep-Alive initialized for: ${url}`);

  // Ping the server every 14 minutes to prevent it from going to sleep
  // (Render free tier spins down after 15 minutes of inactivity)
  const INTERVAL_MS = 14 * 60 * 1000;

  setInterval(() => {
    https
      .get(url, (res) => {
        console.log(`⏰ [CRON] Ping sent to keep server awake. Status: ${res.statusCode}`);
      })
      .on('error', (err) => {
        console.error(`⏰ [CRON] Keep-Alive ping failed: ${err.message}`);
      });
  }, INTERVAL_MS);
};

module.exports = { startKeepAlive };
