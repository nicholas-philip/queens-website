const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { verifyAdmin } = require("../middleware/verifyAdmin");

// Dedicated Customer CRM Routes
router.get("/", verifyAdmin, customerController.getAllCustomers);
router.get("/stats", verifyAdmin, customerController.getCustomerStats);
router.get("/:id", verifyAdmin, customerController.getCustomerById);

// Dynamic CRM actions (Tags, Notes, Blocking)
router.patch("/:id/tags",  verifyAdmin, customerController.updateCustomerTags);
router.patch("/:id/notes", verifyAdmin, customerController.updateCustomerNotes);
router.patch("/:id/block", verifyAdmin, customerController.toggleBlockCustomer);

router.delete("/:id", verifyAdmin, customerController.deleteCustomer);

module.exports = router;
