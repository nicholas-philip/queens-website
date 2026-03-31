const express = require("express");
const router = express.Router();
const { subscribeBackInStock, subscribePush } = require("../controllers/alertController");

// --- NOTIFICATIONS ---
router.post("/back-in-stock", subscribeBackInStock); // Email alert signup
router.post("/subscribe-push", subscribePush);      // FCM token registration

module.exports = router;
