const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");
const dashboard = require("../controllers/dashboardController");

// --- DASHBOARD KPI CARDS ---
router.get("/stats", verifyAdmin, dashboard.getDashboardStats);

module.exports = router;
