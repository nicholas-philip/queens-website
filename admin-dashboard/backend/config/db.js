const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const MAX_DELAY = 30_000;
  const delay = Math.min(5_000 * 2 ** retryCount, MAX_DELAY);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15_000,
      socketTimeoutMS:          45_000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  [DB] Disconnected. Reconnecting...");
      setTimeout(() => connectDB(0), 5_000);
    });

  } catch (error) {
    console.error(`❌ DB Error (attempt ${retryCount + 1}): ${error.message}`);
    console.log(`⏳ Retrying in ${delay / 1000}s...`);
    setTimeout(() => connectDB(retryCount + 1), delay);
  }
};

module.exports = connectDB;
