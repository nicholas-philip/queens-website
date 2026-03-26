// =====================================================
// utils/selfPing.js
// Keeps the Render free-tier server alive by pinging
// the /health endpoint every 14 minutes.
// (Render sleeps after 15 min of inactivity.)
// =====================================================

const { CronJob } = require("cron");
const https = require("https");

const SERVER_URL =
  process.env.RENDER_EXTERNAL_URL || "https://queens-website.onrender.com";

const ping = () => {
  const url = `${SERVER_URL}/health`;
  const req = https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`⏰  Self-ping OK [${new Date().toISOString()}]`);
    } else {
      console.warn(`⚠️  Self-ping got ${res.statusCode} from ${url}`);
    }
    // Drain response body to free socket
    res.resume();
  });
  req.on("error", (e) => {
    console.error(`❌  Self-ping failed: ${e.message}`);
  });
  req.end();
};

const job = new CronJob("*/14 * * * *", ping);

const startSelfPing = () => {
  job.start();
  console.log("⏰  Self-ping started (every 14 min → /health)");
};

module.exports = { startSelfPing };
