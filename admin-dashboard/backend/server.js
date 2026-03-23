// =====================================================
// server.js
// Main entry point for the backend server.
// =====================================================

require("dotenv").config();
require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

// Initialize express app
const app = express();

// Configure Middleware
app.use(helmet());
app.use(cors({
  origin: "*", // Configure this to restrict domains in production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http logger
if (process.env.NODE_ENV === "development" || true) {
  app.use(morgan("dev"));
}

// Mount all API routes
// Note: Based on standard practice, we mount on /api. 
// If your frontend uses urls like /admin/..., change /api to /
app.use("/api", routes);

// Base health-check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Admin Dashboard API is up and running." });
});

// Fallback 404 Route
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API Route not found." });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Fatal Error: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });