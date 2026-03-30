// =====================================================
// config/db.js
//
// Shared MongoDB connection for the Store API.
// Retries indefinitely with exponential backoff so a
// temporary Atlas DNS hiccup doesn't crash the server.
// =====================================================

const mongoose = require("mongoose");

const connectDB = async (retryCount = 0) => {
  const MAX_DELAY = 30_000; // cap at 30 s between retries
  const delay = Math.min(5_000 * 2 ** retryCount, MAX_DELAY);

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15_000, // fail fast per attempt
      socketTimeoutMS:          45_000,
    });

    console.log(`✅ [DB] Connected to MongoDB: ${conn.connection.host}`);
    console.log(`🎯 [DB] Using database: ${conn.connection.name}`);

    // Re-connect automatically if the connection drops later
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  [DB] Disconnected. Reconnecting...");
      setTimeout(() => connectDB(0), 5_000);
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ [DB] Runtime error: ${err.message}`);
    });

  } catch (error) {
    console.error(`❌ [DB] Connection error (attempt ${retryCount + 1}): ${error.message}`);
    console.log(`⏳ [DB] Retrying in ${delay / 1000}s...`);
    // Do NOT call process.exit — keep the server alive and retry
    setTimeout(() => connectDB(retryCount + 1), delay);
  }
};

module.exports = connectDB;
