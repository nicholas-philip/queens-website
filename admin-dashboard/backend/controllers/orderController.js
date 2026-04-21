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
  const { items, subtotal, shipping, tax, discount, total } = req.body;

  // 1. Verify and enrich every item
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId}`});
    }

    // Check stock
    if (!product.hasVariants) {
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${product.title}". Only ${product.stockQuantity} left.` 
        });
      }
    } else if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant || variant.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for variant ${variant?.SKU || "unknown"}.` 
        });
      }
    }

    // Enrich item for the order model
    const price = product.discountPrice !== null ? product.discountPrice : product.price;
    enrichedItems.push({
      productId:  product._id,
      variantId:  item.variantId || null,
      title:      product.title,
      SKU:        product.SKU,
      price:      price,
      quantity:   item.quantity,
      lineTotal:  price * item.quantity
    });
  }

  // 2. Create the order
  const order = await Order.create({
    ...req.body,
    items: enrichedItems,
    currentStatus: "Pending",
    statusHistory: [{ status: "Pending", note: "Order placed." }]
  });

  // 3. Deduct stock (since order was successfully created)
  for (const item of enrichedItems) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    if (!item.variantId) {
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.stockQuantity = 0;
        product.status = "Out of Stock";
      }
    } else {
      const variant = product.variants.id(item.variantId);
      if (variant) {
        variant.stockQuantity -= item.quantity;
        const totalStock = product.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
        if (totalStock <= 0) product.status = "Out of Stock";
      }
    }
    product.totalSold += item.quantity;
    await product.save();
  }

  // 4. Send confirmation email (non-blocking)
  sendOrderConfirmation(order).catch(() => {});

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    order,
  });
});

// ── GET /admin/orders ─────────────────────────────
const getAllOrders = catchAsync(async (req, res) => {
  const result = await filterQuery(Order, req.query, ["currentStatus", "paymentStatus", "paymentMethod"]);
  res.status(200).json({ success: true, ...result });
});

// ── GET /admin/orders/:id ─────────────────────────
const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.productId", "title SKU images price");
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

  order.currentStatus = status;

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

// ── PATCH /admin/orders/:id/payment ────────────────
const updateOrderPayment = catchAsync(async (req, res) => {
  const { paymentStatus, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  order.paymentStatus = paymentStatus;
  
  // Auto-advance fulfillment status if payment is confirmed
  let statusChanged = false;
  let oldStatus = order.currentStatus;
  if (paymentStatus === "Paid" && order.currentStatus === "Pending") {
    order.currentStatus = "Processing";
    statusChanged = true;
  }
  
  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.push({
      status:    order.currentStatus,
      note:      note || `Payment status manually updated to: ${paymentStatus}${statusChanged ? '. Order advanced to Processing.' : ''}`,
      changedBy: req.admin?.name || "Admin",
      changedAt: new Date(),
    });
  }

  await order.save();
  res.status(200).json({ success: true, message: "Payment status updated.", order });
});

// ── PATCH /admin/orders/:id/tracking ─────────────
const addTrackingNumber = catchAsync(async (req, res) => {
  const { trackingNumber, carrier } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ success: false, message: "trackingNumber is required." });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  order.trackingNumber = trackingNumber;
  order.carrier        = carrier || "";
  
  // Automate status change to Shipped
  if (order.currentStatus === "Processing" || order.currentStatus === "Pending") {
    order.currentStatus = "Shipped";
    if (Array.isArray(order.statusHistory)) {
        order.statusHistory.push({
            status: "Shipped",
            note:   `Tracking info added: ${trackingNumber}`,
            changedBy: req.admin?.name || "Admin",
            changedAt: new Date()
        });
    }
  }

  await order.save();
  await logActivity(req, "ADDED_TRACKING", `Order: ${order._id}`, `Tracking: ${trackingNumber}`);

  // Send automated email update with tracking info
  sendOrderStatusUpdate(order, `Tracking information has been added. Your package is now with the carrier.`).catch(() => {});

  res.status(200).json({
    success: true,
    message: "Tracking number added and order marked as Shipped.",
    order,
  });
});

// ── PATCH /admin/orders/:id/shipping ──────────────
const updateShippingFee = catchAsync(async (req, res) => {
  const { shippingFee } = req.body;
  const newShipping = Number(shippingFee) || 0;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const oldTotal = order.total;
  order.shipping = newShipping;
  order.total = order.subtotal + order.tax + newShipping - order.discount;

  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.push({
      status: order.currentStatus,
      note: `Delivery fee set to GHS ${newShipping}. Total changed to GHS ${order.total}.`,
      changedBy: req.admin?.name || "Admin",
      changedAt: new Date()
    });
  }

  await order.save();
  await logActivity(req, "UPDATED_SHIPPING_FEE", `Order: ${order._id}`, `Fee: GHS ${newShipping}`);

  res.status(200).json({ success: true, message: "Delivery fee updated.", order });
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

// ── POST /admin/orders/:id/verify-payment ─────────
// Manually triggers a Paystack check if webhook was missed
const verifyOrderPayment = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  const ref = order.paystackReference || order.orderNumber;
  if (!ref) return res.status(400).json({ success: false, message: "No payment reference or order number found for verification." });

  // Import local service
  const paystackService = require("../utils/paystackService");
  
  // Attempt verification — if it fails (404), catch 
  try {
    const pyData = await paystackService.verifyTransaction(ref);
    if (pyData.status === "success") {
      order.paymentStatus = "Paid";
      order.currentStatus = "Processing";
      order.statusHistory.push({
        status: "Processing",
        note: `Payment manually verified via Paystack. Ref: ${ref}. GHS ${(pyData.amount / 100).toFixed(2)} confirmed.`,
        changedBy: req.admin?.name || "Admin",
        changedAt: new Date()
      });
      await order.save();

      // --- NEW: Update Bookkeeping ---
      const Transaction = require("../models/Transaction");
      const Invoice     = require("../models/Invoice");

      // Format channel for Enum: card -> Card, mobile_money -> Mobile Money
      let method = "Other";
      if (pyData.channel === "card") method = "Card";
      if (pyData.channel === "mobile_money") method = "Mobile Money";
      if (pyData.channel === "bank_transfer") method = "Bank Transfer";

      // 1. Create Transaction (if not exists)
      const exists = await Transaction.findOne({ transactionId: ref });
      if (!exists) {
        await Transaction.create({
          transactionId: ref,
          orderRef:      order._id,
          amount:        pyData.amount / 100,
          status:        "Success",
          paymentMethod: method,
          customerName:  order.customerDetails?.name || "Customer",
          currency:      "GHS",
          gatewayResponse: pyData
        });
      }

      // 2. Mark Invoice as Paid
      await Invoice.findOneAndUpdate({ orderRef: order._id }, { status: "Paid" });

      return res.status(200).json({ success: true, message: "Payment verified! Balance and Order updated.", order });
    }
    return res.status(400).json({ success: false, message: `Bank Gateway Status: ${pyData.status || "Unsuccessful"} for ID: ${ref}` });
  } catch (err) {
    const payError = err.response?.data?.message || err.message;
    return res.status(400).json({ success: false, message: `Gateway check failed for ${ref}: ${payError}` });
  }
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  addTrackingNumber,
  updateAdminNotes,
  deleteOrder,
  updateOrderPayment,
  verifyOrderPayment,
  updateShippingFee,
};// TS file system cache invalidation
