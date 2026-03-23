// =====================================================
// controllers/transactionController.js
// Payment management for the Transactions page.
//
// POST   /api/transactions                    — record payment (webhook)
// GET    /api/admin/transactions              — list
// GET    /api/admin/transactions/summary      — revenue breakdown
// GET    /api/admin/transactions/order/:id    — all attempts for an order
// GET    /api/admin/transactions/:id          — single record
// PATCH  /api/admin/transactions/:id/refund   — process refund
// =====================================================

const Transaction  = require("../models/Transaction");
const Order        = require("../models/Order");
const Invoice      = require("../models/Invoice");
const Notification = require("../models/Notification");
const filterQuery  = require("../utils/filterQuery");
const logActivity  = require("../middleware/activityLogger");
const { sendRefundConfirmation } = require("../utils/Emailservice");


// ── Record payment (called by payment gateway) ─
const createTransaction = async (req, res) => {
  const { transactionId, orderRef, paymentMethod, isMember, amount, status, gatewayResponse } = req.body;

  if (!transactionId || !orderRef || !amount || !status) {
    return res.status(400).json({ success: false, message: "transactionId, orderRef, amount, and status are required." });
  }

  const order = await Order.findById(orderRef);
  if (!order) return res.status(404).json({ success: false, message: `Order not found: ${orderRef}` });

  // Block duplicate webhook calls
  const exists = await Transaction.findOne({ transactionId });
  if (exists) return res.status(409).json({ success: false, message: "Transaction already recorded." });

  const transaction = await Transaction.create({
    transactionId, orderRef, paymentMethod: paymentMethod || "Card",
    isMember: isMember || false, amount, status, gatewayResponse: gatewayResponse || null,
  });

  if (status === "Success") {
    order.currentStatus = "Processing";
    order.statusHistory.push({ status: "Processing", note: `₦${amount.toLocaleString()} confirmed via ${paymentMethod || "Card"}`, changedAt: new Date() });
    await order.save();
    await Invoice.findOneAndUpdate({ orderRef: order._id }, { status: "Paid" });
  }

  if (status === "Failed") {
    order.statusHistory.push({ status: order.currentStatus, note: `Payment FAILED via ${paymentMethod || "Card"}`, changedAt: new Date() });
    await order.save();
    await Notification.notify("PAYMENT_FAILED", `Order ${order.orderNumber} payment failed.`);
  }

  res.status(201).json({ success: true, message: `Transaction recorded: ${status}`, transaction });
};

// ── List all transactions ─────────────────────
const getAllTransactions = async (req, res) => {
  const result = await filterQuery(Transaction, req.query, ["status", "paymentMethod"]);
  res.status(200).json({ success: true, ...result });
};

// ── Revenue summary ───────────────────────────
const getTransactionSummary = async (req, res) => {
  const [revenueRes, refundRes, byMethodRes, failedCount, pendingCount] = await Promise.all([
    Transaction.aggregate([{ $match: { status: "Success" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Transaction.aggregate([{ $match: { status: "Refunded" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Transaction.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $project: { _id: 0, method: "$_id", total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]),
    Transaction.countDocuments({ status: "Failed" }),
    Transaction.countDocuments({ status: "Pending" }),
  ]);

  const totalRevenue  = revenueRes[0]?.total || 0;
  const totalRefunded = refundRes[0]?.total  || 0;

  res.status(200).json({
    success: true,
    summary: {
      totalRevenue, totalRefunded, netRevenue: totalRevenue - totalRefunded,
      totalTransactions: revenueRes[0]?.count || 0,
      totalRefunds:      refundRes[0]?.count  || 0,
      failedAttempts: failedCount, pendingCount,
      byMethod: byMethodRes,
    },
  });
};

// ── All transactions for one order ───────────
const getTransactionsByOrder = async (req, res) => {
  const transactions = await Transaction.find({ orderRef: req.params.orderId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: transactions.length, transactions });
};

// ── Single transaction ────────────────────────
const getTransactionById = async (req, res) => {
  const t = await Transaction.findById(req.params.id)
    .populate({ path: "orderRef", select: "orderNumber customerDetails total currentStatus createdAt" });
  if (!t) return res.status(404).json({ success: false, message: "Transaction not found." });
  res.status(200).json({ success: true, transaction: t });
};

// ── Process refund ────────────────────────────
const refundTransaction = async (req, res) => {
  const { reason } = req.body;
  const t = await Transaction.findById(req.params.id);
  if (!t) return res.status(404).json({ success: false, message: "Transaction not found." });
  if (t.status !== "Success") {
    return res.status(400).json({ success: false, message: `Cannot refund a "${t.status}" transaction.` });
  }

  t.status       = "Refunded";
  t.refundReason = reason || "Refund issued by admin";
  t.refundedAt   = new Date();
  await t.save();

  const order = await Order.findById(t.orderRef);
  if (order) {
    order.currentStatus = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", note: `Refund ₦${t.amount.toLocaleString()}. Reason: ${reason || "N/A"}`, changedAt: new Date() });
    await order.save();
    await Invoice.findOneAndUpdate({ orderRef: order._id }, { status: "Unpaid" });
    await sendRefundConfirmation(order, t, reason);
  }

  await Notification.notify("REFUND_PROCESSED", `₦${t.amount.toLocaleString()} refunded on order ${order?.orderNumber}.`);
  await logActivity(req, "PROCESSED_REFUND", `Transaction: ${t.transactionId}`, `₦${t.amount.toLocaleString()} | Reason: ${reason || "N/A"}`);

  // ── Payment gateway refund API (uncomment to use) ──
  // Paystack: await axios.post("https://api.paystack.co/refund", { transaction: t.transactionId, amount: t.amount * 100 }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
  // Stripe:   await stripe.refunds.create({ payment_intent: t.transactionId });

  res.status(200).json({ success: true, message: `Refund of ₦${t.amount.toLocaleString()} processed.`, transaction: t });
};

module.exports = { createTransaction, getAllTransactions, getTransactionSummary, getTransactionsByOrder, getTransactionById, refundTransaction };