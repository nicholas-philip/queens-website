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

// Catch silent crashes to debug the Nodemon crash issue
process.on("uncaughtException", (err) => {
  console.error("🔥 FATAL UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 FATAL UNHANDLED REJECTION at:", promise, "reason:", reason);
});

const errorHandler     = require("./middleware/errorHandler");
const routes           = require("./routes");
const { initFirebase } = require("./utils/firebase");

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
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  "https://queens-website-three.vercel.app",
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
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Capture raw body for Paystack signature check on the webhook route
      if (req.originalUrl === "/transactions") {
        req.rawBody = buf.toString();
      }
    },
    limit: "10mb",
  })
);
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
app.use("/api", routes);

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
const PORT      = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env — cannot start.");
  process.exit(1);
}

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌  Port ${PORT} is already in use. Retrying in 5s (Windows port release delay)...`);
      setTimeout(() => {
        server.close();
        startServer();
      }, 5000);
    } else {
      console.error("❌  Server error:", err.message);
    }
  });
};

const connectWithRetry = async (retryCount = 0) => {
  const delay = Math.min(5_000 * 2 ** retryCount, 30_000);
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15_000,
      socketTimeoutMS:          45_000,
    });
    console.log("✅  MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️   MongoDB disconnected — reconnecting...");
      setTimeout(() => connectWithRetry(0), 5_000);
    });

    startServer();
  } catch (err) {
    console.error(`❌  MongoDB connection error (attempt ${retryCount + 1}):`, err.message);
    console.log(`⏳  Retrying in ${delay / 1000}s...`);
    setTimeout(() => connectWithRetry(retryCount + 1), delay);
  }
};

connectWithRetry();

module.exports = app;