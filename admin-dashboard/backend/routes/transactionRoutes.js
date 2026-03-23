const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");
const transaction = require("../controllers/transactionController");

// --- PAYMENTS & REFUNDS ---
router.post("/", transaction.createTransaction); // Webhook (Public-ish)
router.get("/", verifyAdmin, transaction.getAllTransactions);
router.get("/summary", verifyAdmin, transaction.getTransactionSummary);
router.get("/order/:orderId", verifyAdmin, transaction.getTransactionsByOrder);
router.get("/:id", verifyAdmin, transaction.getTransactionById);
router.post("/:id/refund", verifyAdmin, transaction.refundTransaction);

module.exports = router;
