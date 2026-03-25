// =====================================================
// utils/selfPing.js
// Keeps the Render server alive by pinging it every
// 14 minutes (Render free tier sleeps after 15 min).
// =====================================================

const { CronJob } = require("cron");
const https = require("https");

const SERVER_URL = process.env.RENDER_EXTERNAL_URL || "https://queens-website.onrender.com";

const job = new CronJob("*/14 * * * *", function () {
  const healthUrl = `${SERVER_URL}/`;

  console.log(`⏰ Cron: Pinging ${healthUrl}`);

  const req = https.get(healthUrl, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Cron: Server is alive");
    } else {
      console.log(`⚠️ Cron: Server responded with status ${res.statusCode}`);
    }
  });

  req.on("error", (e) => {
    console.error(`❌ Cron: Error pinging server: ${e.message}`);
  });

  req.end();
});

const startSelfPing = () => {
  job.start();
  console.log("⏰ Self-ping cron job started (every 14 minutes)");
};

module.exports = { startSelfPing };
