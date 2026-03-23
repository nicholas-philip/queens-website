// =====================================================
// controllers/dashboardController.js
// Powers the main KPI cards on the dashboard home page.
// All heavy queries run in parallel with Promise.all.
//
// GET /api/admin/dashboard/stats
// =====================================================

const Order        = require("../models/Order");
const Product      = require("../models/Product");
const Transaction  = require("../models/Transaction");
const Customer     = require("../models/Customer");
const ActivityLog  = require("../models/ActivityLog");
const Review       = require("../models/Review");

// Calculate % growth: ((current - previous) / previous) * 100
const growth = (current, prev) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - prev) / prev) * 100).toFixed(1));
};

const getDashboardStats = async (req, res) => {
  const now              = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth   = new Date(startOfThisMonth - 1);

  // Run every query simultaneously — much faster than one-by-one
  const [
    totalRevenueRes,
    thisMonthRevenueRes,
    lastMonthRevenueRes,
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    totalCustomers,
    customersThisMonth,
    customersLastMonth,
    outOfStock,
    lowStock,
    drafts,
    pendingOrders,
    recentOrders,
    recentActivity,
    pendingReviews,
    totalProducts,
  ] = await Promise.all([
    Transaction.aggregate([{ $match: { status: "Success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { status: "Success", createdAt: { $gte: startOfThisMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { status: "Success", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Customer.countDocuments(),
    Customer.countDocuments({ firstOrderDate: { $gte: startOfThisMonth } }),
    Customer.countDocuments({ firstOrderDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Product.countDocuments({ status: "Out of Stock" }),
    Product.countDocuments({ stockQuantity: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ status: "Draft" }),
    Order.countDocuments({ currentStatus: "Pending" }),
    Order.find().sort({ createdAt: -1 }).limit(8)
      .select("orderNumber customerDetails.name total currentStatus createdAt"),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10)
      .select("adminName action target createdAt"),
    Review.countDocuments({ isApproved: false }),
    Product.countDocuments(),
  ]);

  const totalRevenue     = totalRevenueRes[0]?.total     || 0;
  const revenueThisMonth = thisMonthRevenueRes[0]?.total || 0;
  const revenueLastMonth = lastMonthRevenueRes[0]?.total || 0;

  res.status(200).json({
    success: true,
    stats: {
      revenue: {
        total:         totalRevenue,
        thisMonth:     revenueThisMonth,
        lastMonth:     revenueLastMonth,
        growthPercent: growth(revenueThisMonth, revenueLastMonth),
      },
      orders: {
        total:         totalOrders,
        thisMonth:     ordersThisMonth,
        lastMonth:     ordersLastMonth,
        growthPercent: growth(ordersThisMonth, ordersLastMonth),
        pendingCount:  pendingOrders,
      },
      customers: {
        total:         totalCustomers,
        thisMonth:     customersThisMonth,
        lastMonth:     customersLastMonth,
        growthPercent: growth(customersThisMonth, customersLastMonth),
      },
      inventory: {
        totalProducts,
        outOfStock,
        lowStock,
        drafts,
      },
      pendingReviews,
      recentOrders,
      recentActivity,
    },
  });
};

module.exports = { getDashboardStats };