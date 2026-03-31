// =====================================================
// server.js
// Buyer Store API - Main Entry Point
// =====================================================

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Connect to Database ---
connectDB();

// --- Middleware ---
app.use(helmet());
app.use(morgan("dev"));

// Body parsing — Capture raw body for Paystack signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      // If we are on the webhook route, store the buffer for signature check
      if (req.originalUrl === "/api/payment/webhook") {
        req.rawBody = buf.toString();
      }
    },
    limit: "5mb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// --- CORS ---
const buyerOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || buyerOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" not allowed.`));
  },
  methods:     ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
}));

// --- Routes ---
// Core Commerce
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));

// Extended Storefront Features
app.use("/api/store",    require("./routes/storeRoutes"));
app.use("/api/blog",     require("./routes/blogRoutes"));
app.use("/api/faq",      require("./routes/faqRoutes"));
app.use("/api/shipping", require("./routes/shippingRoutes"));
app.use("/api/loyalty",  require("./routes/loyaltyRoutes"));
app.use("/api/quiz",     require("./routes/quizRoutes"));
app.use("/api/contact",  require("./routes/contactRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/reviews",  require("./routes/reviewRoutes"));

// Payments
app.use("/api/payment",    require("./routes/paymentRoutes"));

// Promotions, Collections & Alerts
app.use("/api/collections", require("./routes/collectionRoutes"));
app.use("/api/alerts",      require("./routes/alertRoutes"));
app.use("/api/returns",     require("./routes/returnRoutes"));
app.use("/api/gift-cards",  require("./routes/giftCardRoutes"));

// --- Base Route ---
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "🚀 Queens Buyer API is live and well!", 
  });
});

// --- Error Handling ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`📡 [STORE] Server listening on port ${PORT}`);
});

module.exports = app;
