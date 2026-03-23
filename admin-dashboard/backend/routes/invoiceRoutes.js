const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");
const invoice = require("../controllers/invoiceController");

// --- INVOICE TRACKING ---
router.get("/", verifyAdmin, invoice.getAllInvoices);
router.get("/summary", verifyAdmin, invoice.getInvoiceSummary);
router.get("/overdue", verifyAdmin, invoice.getOverdueInvoices);
router.get("/:id", verifyAdmin, invoice.getInvoiceById);
router.patch("/:id/status", verifyAdmin, invoice.updateInvoiceStatus);

module.exports = router;
