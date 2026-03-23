// =====================================================
// controllers/analyticsController.js
// Chart data for the Analytics page.
//
// GET /api/admin/analytics/overview        — all at once
// GET /api/admin/analytics/revenue?days=30 — daily line chart
// GET /api/admin/analytics/orders          — status pie chart
// GET /api/admin/analytics/top-products    — best sellers bar chart
// GET /api/admin/analytics/categories      — revenue by category
// =====================================================

const Order       = require("../models/Order");
const Transaction = require("../models/Transaction");
const Product     = require("../models/Product");

// ── Daily revenue chart ───────────────────────
const getDailyRevenue = async (req, res) => {
  const days   = Math.min(parseInt(req.query.days) || 30, 365);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await Transaction.aggregate([
    { $match: { status: "Success", createdAt: { $gte: cutoff } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
      revenue: { $sum: "$amount" },
      count:   { $sum: 1 },
    }},
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    { $project: {
      _id: 0,
      date: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: "$_id.day" } } } },
      revenue: 1,
      orders: "$count",
    }},
  ]);

  res.status(200).json({ success: true, period: `Last ${days} days`, data });
};

// ── Orders by status pie chart ────────────────
const getOrdersByStatus = async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);

  const total = result.reduce((s, r) => s + r.count, 0);
  const data  = result.map((r) => ({
    ...r,
    percentage: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(1)) : 0,
  }));

  res.status(200).json({ success: true, totalOrders: total, data });
};

// ── Top products bar chart ────────────────────
const getTopProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data  = await Product.find()
    .sort({ totalSold: -1 })
    .limit(limit)
    .populate("category", "name")
    .select("title SKU price discountPrice totalSold stockQuantity images status category averageRating");

  res.status(200).json({ success: true, data });
};

// ── Revenue by category ───────────────────────
const getSalesByCategory = async (req, res) => {
  const data = await Order.aggregate([
    { $match: { currentStatus: { $in: ["Processing","Shipped","Delivered"] } } },
    { $unwind: "$items" },
    { $lookup: { from: "products",   localField: "items.productId", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.name", revenue: { $sum: "$items.lineTotal" }, unitsSold: { $sum: "$items.quantity" }, orderCount: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", revenue: 1, unitsSold: 1, orderCount: 1 } },
    { $sort: { revenue: -1 } },
  ]);

  res.status(200).json({ success: true, data });
};

// ── All charts in one request (dashboard overview) ──
const getAnalyticsOverview = async (req, res) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [dailyRevenue, ordersByStatus, topProducts, byCategory] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: "Success", createdAt: { $gte: cutoff } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1 } },
    ]),
    Order.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    Product.find().sort({ totalSold: -1 }).limit(5).select("title totalSold images averageRating"),
    Order.aggregate([
      { $match: { currentStatus: { $in: ["Processing","Shipped","Delivered"] } } },
      { $unwind: "$items" },
      { $lookup: { from: "products",   localField: "items.productId", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $lookup: { from: "categories", localField: "p.category",      foreignField: "_id", as: "c" } },
      { $unwind: "$c" },
      { $group: { _id: "$c.name", revenue: { $sum: "$items.lineTotal" } } },
      { $project: { _id: 0, category: "$_id", revenue: 1 } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
  ]);

  res.status(200).json({ success: true, data: { dailyRevenue, ordersByStatus, topProducts, byCategory } });
};

module.exports = { getDailyRevenue, getOrdersByStatus, getTopProducts, getSalesByCategory, getAnalyticsOverview };