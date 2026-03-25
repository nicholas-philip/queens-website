const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyAdmin } = require("../middleware/verifyAdmin");

// --- ORDER ACTIONS (1:1 Mapping) ---
router.get("/", verifyAdmin, orderController.getAllOrders);
router.post("/", orderController.createOrder); // Public checkout
router.get("/:id", verifyAdmin, orderController.getOrder);
router.patch("/:id/status", verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
