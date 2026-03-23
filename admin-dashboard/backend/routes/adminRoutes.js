const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");

// Importing ONLY the controllers from adminController.js (1:1 Mapping)
const { 
  adminController, 
  notificationController, 
  settingsController, 
  bulkController, 
  exportController, 
  searchController 
} = require("../controllers/adminController");

// --- TEAM MANAGEMENT ---
router.get("/team", verifyAdmin, adminController.getAllAdmins);
router.get("/team/:id", verifyAdmin, adminController.getAdminById);
router.post("/team", verifyAdmin, adminController.createAdmin);
router.patch("/team/:id", verifyAdmin, adminController.updateAdmin);
router.delete("/team/:id", verifyAdmin, adminController.deleteAdmin);

// --- SEARCH ---
router.get("/search", verifyAdmin, searchController.globalSearch);

// --- SETTINGS ---
router.get("/settings", verifyAdmin, settingsController.getSettings);
router.patch("/settings", verifyAdmin, settingsController.updateSettings);

// --- NOTIFICATIONS ---
router.get("/notifications", verifyAdmin, notificationController.getNotifications);
router.patch("/notifications/read-all", verifyAdmin, notificationController.markAllRead);

// --- BULK ACTIONS ---
router.post("/bulk/orders", verifyAdmin, bulkController.bulkUpdateOrderStatus);
router.post("/bulk/products", verifyAdmin, bulkController.bulkUpdateProductStatus);
router.post("/bulk/restock", verifyAdmin, bulkController.bulkRestockProducts);

// --- EXPORTS ---
router.get("/export/orders", verifyAdmin, exportController.exportOrders);
router.get("/export/transactions", verifyAdmin, exportController.exportTransactions);
router.get("/export/products", verifyAdmin, exportController.exportProducts);

module.exports = router;
