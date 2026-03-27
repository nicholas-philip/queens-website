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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Raw body capture for Paystack webhook signature verification
// MUST be before express.json() to intercept /api/payment/webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      req.rawBody = data;
      req.body = JSON.parse(data || "{}");
      next();
    });
  } else {
    next();
  }
});
app.use(helmet());
app.use(morgan("dev"));

// --- CORS ---
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5174",
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
