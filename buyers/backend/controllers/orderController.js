// =====================================================
// controllers/orderController.js (Storefront)
//
// POST /api/orders               — place an order
// GET  /api/orders/track/:number — track by order number
// POST /api/transactions         — record payment (gateway webhook)
// POST /api/coupons/validate     — validate a coupon code
// POST /api/leads                — capture checkout leads
// =====================================================

const Order        = require("../models/Order");
const Product      = require("../models/Product");
const Coupon       = require("../models/Coupon");
const Invoice      = require("../models/Invoice");
const Customer     = require("../models/Customer");
const Transaction  = require("../models/Transaction");
const Notification = require("../models/Notification");
const Settings     = require("../models/Settings");
const { sendOrderConfirmation, sendStatusUpdate } = require("../utils/emailService");

// ── POST /api/orders — Guest checkout ─────────────
const placeOrder = async (req, res) => {
  const { customerDetails, items, couponCode, shipping = 0, tax = 0 } = req.body;

  if (!customerDetails || !items?.length) {
    return res.status(400).json({ success: false, message: "Customer details and items are required." });
  }

  const settings = await Settings.getSettings();

  // Check if blocked customer
  const existing = await Customer.findOne({ phone: customerDetails.phone });
  if (existing?.isBlocked) {
    return res.status(403).json({ success: false, message: "Unable to process this order. Please contact support." });
  }

  // Validate all items before changing anything
  const validated = [];
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ success: false, message: "Each item requires productId and quantity ≥ 1." });
    }
    const product = await Product.findById(item.productId);
    if (!product || product.status !== "Active") {
      return res.status(400).json({ success: false, message: `Product not available: ${item.productId}` });
    }
    if (item.variantId && product.hasVariants) {
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive)         return res.status(400).json({ success: false, message: `Variant not available.` });
      if (variant.stockQuantity < item.quantity) return res.status(400).json({ success: false, message: `Not enough stock for "${product.title}".` });
      validated.push({ product, variant, quantity: item.quantity, selectedSize: item.selectedSize, selectedColor: item.selectedColor });
    } else {
      if (product.stockQuantity < item.quantity) return res.status(400).json({ success: false, message: `Not enough stock for "${product.title}". Only ${product.stockQuantity} left.` });
      validated.push({ product, variant: null, quantity: item.quantity, selectedSize: item.selectedSize, selectedColor: item.selectedColor });
    }
  }

  // Build items + subtotal
  const orderItems = [];
  let subtotal = 0;
  for (const { product, variant, quantity, selectedSize, selectedColor } of validated) {
    const base      = product.discountPrice !== null ? product.discountPrice : product.price;
    const unitPrice = variant ? base + (variant.priceAdjustment || 0) : base;
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;
    
    // Combine existing variant attributes and new UI options
    const attributes = variant?.attributes || {};
    if (selectedSize) attributes.Size = selectedSize;
    if (selectedColor) attributes.Color = selectedColor;

    orderItems.push({
      productId:  product._id,
      variantId:  variant?._id || null,
      title:      product.title,
      SKU:        variant ? variant.SKU : product.SKU,
      attributes: Object.keys(attributes).length > 0 ? attributes : null,
      price:      unitPrice,
      quantity,
      lineTotal,
    });
  }

  // Minimum order amount
  if (settings.minimumOrderAmount > 0 && subtotal < settings.minimumOrderAmount) {
    return res.status(400).json({ success: false, message: `Minimum order amount is GHS ${settings.minimumOrderAmount.toLocaleString()}.` });
  }

  // Apply coupon
  let discount = 0, appliedCode = null, couponDoc = null;
  if (couponCode?.trim()) {
    couponDoc = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
    if (!couponDoc) return res.status(404).json({ success: false, message: "Coupon code not found." });
    const check = couponDoc.isValid(subtotal);
    if (!check.valid) return res.status(400).json({ success: false, message: check.reason });
    discount    = couponDoc.calculateDiscount(subtotal);
    appliedCode = couponDoc.code;
  }

  // Calculate shipping (use settings free shipping threshold)
  let shippingFee = Number(shipping);
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) shippingFee = 0;

  const taxAmount = Number(tax);
  const total     = subtotal - discount + taxAmount + shippingFee;

  // Create order
  const order = await Order.create({
    customerDetails, items: orderItems,
    subtotal, discount, tax: taxAmount, shipping: shippingFee, total,
    couponCode:    appliedCode,
    currentStatus: "Pending",
    statusHistory: [{ status: "Pending", note: "Order placed via storefront", changedAt: new Date() }],
  });

  // Deduct stock
  for (const { product, variant, quantity } of validated) {
    if (variant) {
      variant.stockQuantity -= quantity;
      const left = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
      if (left === 0) product.status = "Out of Stock";
    } else {
      product.stockQuantity -= quantity;
      if (product.stockQuantity === 0) product.status = "Out of Stock";
    }
    product.totalSold += quantity;
    await product.save();
  }

  // Increment coupon usage
  if (couponDoc) { couponDoc.usedCount += 1; await couponDoc.save(); }

  // Create invoice
  await Invoice.create({
    orderRef: order._id, customerName: customerDetails.name,
    customerEmail: customerDetails.email || "",
    items: orderItems.map(i => ({ title: i.title, SKU: i.SKU, quantity: i.quantity, price: i.price, lineTotal: i.lineTotal })),
    subtotal, discount, tax: taxAmount, shippingCharge: shippingFee, amount: total,
    couponCode: appliedCode, status: "Unpaid",
  });

  // Update customer CRM
  await Customer.updateFromOrder(order);

  // Push admin notification
  await Notification.push("NEW_ORDER", `New Order ${order.orderNumber}`, `GHS ${total.toLocaleString()} from ${customerDetails.name}`, `/admin/orders/${order._id}`);

  // Send confirmation email
  await sendOrderConfirmation(order);

  res.status(201).json({
    success: true,
    message: "Order placed successfully! You'll receive a confirmation email shortly.",
    order: {
      orderNumber:   order.orderNumber,
      total,
      currentStatus: order.currentStatus,
      _id:           order._id,
    },
  });
};

// ── GET /api/orders/track/:orderNumber ─────────────
const trackOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .select("orderNumber customerDetails.name currentStatus statusHistory total tracking createdAt");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found. Check your order number." });
  }

  res.status(200).json({ success: true, order });
};

// ── POST /api/transactions — Payment gateway webhook ─
const recordTransaction = async (req, res) => {
  const { transactionId, orderRef, paymentMethod, amount, status, gatewayResponse } = req.body;

  if (!transactionId || !orderRef || !amount || !status) {
    return res.status(400).json({ success: false, message: "transactionId, orderRef, amount, status required." });
  }

  const order = await Order.findById(orderRef);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  // Block duplicate webhooks
  const exists = await Transaction.findOne({ transactionId });
  if (exists)  return res.status(409).json({ success: false, message: "Transaction already recorded." });

  const transaction = await Transaction.create({
    transactionId, orderRef, paymentMethod: paymentMethod || "Card",
    amount, status, gatewayResponse: gatewayResponse || null,
  });

  if (status === "Success") {
    order.currentStatus = "Processing";
    order.statusHistory.push({ status: "Processing", note: `GHS ${amount.toLocaleString()} confirmed via ${paymentMethod || "Card"}`, changedAt: new Date() });
    await order.save();
    // Mark invoice paid
    await Invoice.findOneAndUpdate({ orderRef: order._id }, { status: "Paid" });
    await sendStatusUpdate(order);
  }

  res.status(201).json({ success: true, message: "Transaction recorded.", status });
};

// ── POST /api/coupons/validate ─────────────────────
const validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;
  if (!code || orderTotal === undefined) {
    return res.status(400).json({ success: false, message: "code and orderTotal are required." });
  }
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found.", isValid: false });
  const check = coupon.isValid(Number(orderTotal));
  if (!check.valid) return res.status(400).json({ success: false, message: check.reason, isValid: false });
  const discountAmount = coupon.calculateDiscount(Number(orderTotal));
  res.status(200).json({
    success: true, isValid: true, couponCode: coupon.code,
    discountType: coupon.discountType, discountValue: coupon.discountValue,
    discountAmount, newTotal: Number(orderTotal) - discountAmount,
    message: `Code applied! You save GHS ${discountAmount.toLocaleString()}.`,
  });
};

// ── POST /api/leads — Capture checkout leads ────────
const createLead = async (req, res) => {
  try {
    const { name, email, phone, cartItems, cartTotal, source } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: "Name and phone are required." });
    
    // Check if lead already exists for this phone recently (within 12 hours)
    const Lead = require("../models/Lead");
    const recent = await Lead.findOne({ 
      phone, 
      createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } 
    });
    
    if (recent) return res.status(200).json({ success: true, message: "Lead updated." });

    await Lead.create({ name, email, phone, cartItems, cartTotal, source });
    res.status(201).json({ success: true, message: "Lead captured! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, trackOrder, recordTransaction, validateCoupon, createLead };