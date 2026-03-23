// =====================================================
// controllers/orderController.js
//
// Order management for the admin dashboard.
//
// Routes:
//   POST   /orders                      → createOrder        (public — guest checkout)
//   GET    /admin/orders                → getAllOrders
//   GET    /admin/orders/:id            → getOrderById
//   PATCH  /admin/orders/:id/status     → updateOrderStatus
//   PATCH  /admin/orders/:id/tracking   → addTrackingNumber
//   PATCH  /admin/orders/:id/notes      → updateAdminNotes
//   DELETE /admin/orders/:id            → deleteOrder
// =====================================================

const Order      = require("../models/Order");
const Product    = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const filterQuery = require("../utils/filterQuery");
const logActivity = require("../middleware/activityLogger");
const { sendOrderConfirmation, sendOrderStatusUpdate } = require("../utils/Emailservice");

// ── POST /orders (public — guest checkout) ────────
const createOrder = catchAsync(async (req, res) => {
  // Check stock for every item before creating order
  for (const item of req.body.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.product}`,
      });
    }
    if (product.stock !== undefined && product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
      });
    }
  }

  const order = await Order.create(req.body);

  // Deduct stock
  for (const item of req.body.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, totalSold: item.quantity },
    });
  }

  // Send confirmation email (non-blocking)
  sendOrderConfirmation(order).catch(() => {});

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    order,
  });
});

// ── GET /admin/orders ─────────────────────────────
const getAllOrders = catchAsync(async (req, res) => {
  const result = await filterQuery(Order, req.query, ["status", "paymentMethod"]);
  res.status(200).json({ success: true, ...result });
});

// ── GET /admin/orders/:id ─────────────────────────
const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name sku images price");
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }
  res.status(200).json({ success: true, order });
});

// ── PATCH /admin/orders/:id/status ────────────────
const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  order.status = status;

  // Push to status history if the model supports it
  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.push({
      status,
      note:      note || "",
      changedBy: req.admin?.name || "Admin",
      changedAt: new Date(),
    });
  }

  await order.save();

  // Notify customer by email (non-blocking)
  sendOrderStatusUpdate(order, note).catch(() => {});

  await logActivity(req, "UPDATED_ORDER_STATUS", `Order: ${order._id}`, `Status → ${status}`);

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}".`,
    order,
  });
});

// ── PATCH /admin/orders/:id/tracking ─────────────
const addTrackingNumber = catchAsync(async (req, res) => {
  const { trackingNumber, carrier } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ success: false, message: "trackingNumber is required." });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { trackingNumber, carrier: carrier || "" },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  await logActivity(req, "ADDED_TRACKING", `Order: ${order._id}`, `Tracking: ${trackingNumber}`);

  res.status(200).json({
    success: true,
    message: "Tracking number added.",
    trackingNumber: order.trackingNumber,
    order,
  });
});

// ── PATCH /admin/orders/:id/notes ─────────────────
const updateAdminNotes = catchAsync(async (req, res) => {
  const { notes } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { adminNotes: notes },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  res.status(200).json({ success: true, message: "Admin notes updated.", order });
});

// ── DELETE /admin/orders/:id ──────────────────────
const deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  await logActivity(req, "DELETED_ORDER", `Order: ${order._id}`);
  res.status(200).json({ success: true, message: "Order deleted." });
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  addTrackingNumber,
  updateAdminNotes,
  deleteOrder,
};// TS file system cache invalidation
