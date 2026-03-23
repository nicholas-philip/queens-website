// =====================================================
// controllers/invoiceController.js
// Invoice management for the Invoices page.
//
// GET    /api/admin/invoices           — list
// GET    /api/admin/invoices/summary   — stats
// GET    /api/admin/invoices/overdue   — overdue list
// GET    /api/admin/invoices/:id       — single
// PATCH  /api/admin/invoices/:id/status
// =====================================================

const Invoice     = require("../models/Invoice");
const filterQuery = require("../utils/filterQuery");
const logActivity = require("../middleware/activityLogger");

const getAllInvoices = async (req, res) => {
  const result = await filterQuery(Invoice, req.query, ["status"]);
  res.status(200).json({ success: true, ...result });
};

const getInvoiceSummary = async (req, res) => {
  const [paid, unpaid, overdue] = await Promise.all([
    Invoice.aggregate([{ $match: { status: "Paid" } },    { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    Invoice.aggregate([{ $match: { status: "Unpaid" } },  { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    Invoice.aggregate([{ $match: { status: "Overdue" } }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
  ]);
  const unpaidTotal  = unpaid[0]?.total  || 0;
  const overdueTotal = overdue[0]?.total || 0;
  res.status(200).json({
    success: true,
    summary: {
      paidCount:  paid[0]?.count   || 0, paidTotal:   paid[0]?.total  || 0,
      unpaidCount: unpaid[0]?.count || 0, unpaidTotal,
      overdueCount: overdue[0]?.count || 0, overdueTotal,
      totalOutstanding: unpaidTotal + overdueTotal,
    },
  });
};

const getOverdueInvoices = async (req, res) => {
  const today   = new Date();
  const invoices = await Invoice.find({ status: { $ne: "Paid" }, dueDate: { $lt: today } }).sort({ dueDate: 1 });
  if (invoices.length) {
    await Invoice.updateMany({ _id: { $in: invoices.map((i) => i._id) } }, { status: "Overdue" });
  }
  res.status(200).json({ success: true, count: invoices.length, invoices });
};

const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate({ path: "orderRef", select: "orderNumber customerDetails items total currentStatus trackingNumber createdAt" });
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." });
  res.status(200).json({ success: true, invoice });
};

const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ["Paid", "Unpaid", "Overdue"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: `Status must be: ${valid.join(", ")}` });

  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." });

  await logActivity(req, "UPDATED_INVOICE_STATUS", `Invoice: ${invoice.invoiceId}`, `→ ${status}`);
  res.status(200).json({ success: true, message: `Invoice ${invoice.invoiceId} marked "${status}".`, invoice });
};

module.exports = { getAllInvoices, getInvoiceSummary, getOverdueInvoices, getInvoiceById, updateInvoiceStatus };