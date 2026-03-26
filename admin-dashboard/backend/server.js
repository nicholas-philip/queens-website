// =====================================================
// server.js
// Main entry point for the backend server.
// =====================================================

require("dotenv").config();
require("express-async-errors");
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const morgan   = require("morgan");
const helmet   = require("helmet");

const errorHandler    = require("./middleware/errorHandler");
const routes          = require("./routes");
const { initFirebase } = require("./utils/firebase");
const { startSelfPing } = require("./utils/selfPing");

// Initialize Firebase Admin SDK at startup
initFirebase();

const app = express();

// ── CORS ─────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://queens-website-three.vercel.app",  // production frontend vercel
    "https://queens-admin-frontend.onrender.com",// old blocked frontend render
    "https://queens-portal-ui.onrender.com",     // new safe frontend render
    process.env.FRONTEND_URL,                    // additional overrides via Render env vars
    process.env.ADMIN_CLIENT_URL,                // fallback
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Auth-Provider"],
  optionsSuccessStatus: 200,
}));

// Handle preflight for all routes
app.options("*", cors());

// ── Core Middleware ───────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Routes ───────────────────────────────────────
// Mounted at "/" so frontend calls /auth/login, /admin/... work as-is
app.use("/", routes);

// Base health-check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Admin Dashboard API is up and running." });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route not found." });
});

// Global Error Handler
app.use(errorHandler);

// ── Database & Server ─────────────────────────────
const PORT     = process.env.PORT || 5000;
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
      // Start self-ping to prevent Render free-tier sleep
      if (process.env.NODE_ENV === "production") {
        startSelfPing();
      }
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });