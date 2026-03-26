// =====================================================
// server.js
// Main entry point for the Queens Admin Dashboard API.
// =====================================================

require("dotenv").config();
require("express-async-errors");

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const morgan     = require("morgan");
const helmet     = require("helmet");
const compression = require("compression");

const errorHandler     = require("./middleware/errorHandler");
const routes           = require("./routes");
const { initFirebase } = require("./utils/firebase");
const { startSelfPing }= require("./utils/selfPing");

// ── Bootstrap external services ───────────────────
initFirebase();

const app = express();

// ── Security headers ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── CORS ──────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://queens-website-three.vercel.app",
  "https://queens-admin-frontend.onrender.com",
  "https://queens-portal-ui.onrender.com",
  process.env.FRONTEND_URL,
  process.env.ADMIN_CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" not allowed.`));
  },
  credentials:         true,
  methods:             ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:      ["Content-Type", "Authorization", "X-Auth-Provider"],
  optionsSuccessStatus: 200,
}));

// Explicit pre-flight handler for all routes
app.options("*", cors());

// ── Compression (gzip) ────────────────────────────
app.use(compression());

// ── Body parsing ─────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── HTTP request logging ──────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Trust proxy (needed for correct IP behind Render/Vercel) ──
app.set("trust proxy", 1);

// ── Health check (before routes so it's always fast) ─
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime:  process.uptime(),
    env:     process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────
app.use("/", routes);

// ── Root info ────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Queens Admin Dashboard API", version: "1.0.0" });
});

// ── 404 handler ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler (must be last) ──────────
app.use(errorHandler);

// ── Connect to MongoDB then start server ──────────
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env — cannot start.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
      if (process.env.NODE_ENV === "production") {
        startSelfPing();
      }
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  });