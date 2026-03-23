const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");
const analytics = require("../controllers/analyticsController");

// --- ANALYTICS ---
router.get("/overview", verifyAdmin, analytics.getAnalyticsOverview);
router.get("/sales",    verifyAdmin, analytics.getDailyRevenue);
router.get("/status",   verifyAdmin, analytics.getOrdersByStatus);
router.get("/top-products", verifyAdmin, analytics.getTopProducts);
router.get("/category", verifyAdmin, analytics.getSalesByCategory);

module.exports = router;
