// =====================================================
// config/db.js
//
// Shared MongoDB connection for the Store API.
// =====================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ [DB] Connected to MongoDB: ${conn.connection.host}`);
    console.log(`🎯 [DB] Using database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ [DB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
