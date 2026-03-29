// =====================================================
// routes/index.js
// All API routes registered in one place.
// Import this in server.js with: require("./routes")
// =====================================================

const express = require("express");
const router  = express.Router();

// ── Middleware ────────────────────────────────────
const { verifyAdmin, requireSuperAdmin } = require("../middleware/verifyAdmin");
const { validate, schemas }              = require("../middleware/validate");
const {
  loginLimiter, registerLimiter,
  forgotPasswordLimiter, resendVerificationLimiter,
} = require("../middleware/Ratelimiter");
const { upload }                         = require("../utils/Cloudinaryupload");
const { verifyPaystackWebhook } = require("../middleware/verifyWebhook");

// ── Controllers ───────────────────────────────────
const {
  registerAdmin, verifyEmail, resendVerification,
  loginAdmin, forgotPassword, resetPassword,
  changePassword, getMyProfile, logoutAdmin,
  firebaseLogin, firebaseLink,
} = require("../controllers/authController");

const { getDailyRevenue, getOrdersByStatus, getTopProducts, getSalesByCategory, getAnalyticsOverview } = require("../controllers/analyticsController");
const { getProducts, getProductById, createProduct, updateProduct, updateProductStatus, adjustStock, deleteProduct, getLowStockProducts, addVariant, updateVariant, deleteVariant } = require("../controllers/productController");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, addTrackingNumber, updateAdminNotes, deleteOrder, updateOrderPayment } = require("../controllers/orderController");
const { getAllCustomers, getCustomerStats, getCustomerById, updateCustomerTags, updateCustomerNotes, toggleBlockCustomer, deleteCustomer } = require("../controllers/customerController");
const { createTransaction, getAllTransactions, getTransactionSummary, getTransactionsByOrder, getTransactionById, refundTransaction } = require("../controllers/transactionController");
const { getAllInvoices, getInvoiceSummary, getOverdueInvoices, getInvoiceById, updateInvoiceStatus } = require("../controllers/invoiceController");

const cat  = require("../controllers/categoryController");
const coup = require("../controllers/couponController");
const rev  = require("../controllers/reviewController");
const { adminController: adm,
        notificationController: notif,
        settingsController: sett,
        bulkController: bulk,
        exportController: exp,
        searchController: srch }       = require("../controllers/adminController");
const { getDashboardStats } = require("../controllers/dashboardController");

// =====================================================
// AUTH — Express JWT flows
// =====================================================
// Register → sends verification email
// DISABLE PUBLIC REGISTRATION (Admins should be created from within the dashboard by a SuperAdmin)
// router.post("/auth/register",             registerLimiter,           validate(schemas.register),           registerAdmin);
// Verify email with token from the link
router.post("/auth/verify-email",                                    validate(schemas.verifyEmail),         verifyEmail);
// Resend verification email if it expired
router.post("/auth/resend-verification",  resendVerificationLimiter, validate(schemas.resendVerification),  resendVerification);
// Login with email + password → returns JWT token
router.post("/auth/login",                loginLimiter,              validate(schemas.login),               loginAdmin);
// Forgot password → sends reset email
router.post("/auth/forgot-password",      forgotPasswordLimiter,     validate(schemas.forgotPassword),      forgotPassword);
// Reset password with token from email link
router.post("/auth/reset-password",                                  validate(schemas.resetPassword),       resetPassword);
// Change password while logged in
router.post("/auth/change-password",      verifyAdmin,               validate(schemas.changePassword),      changePassword);
// Get logged-in admin profile
router.get ("/auth/me",                   verifyAdmin,                                                      getMyProfile);
// Logout (logs the action — frontend must delete token)
router.post("/auth/logout",               verifyAdmin,                                                      logoutAdmin);

// =====================================================
// AUTH — Firebase flows
// =====================================================
// Login via Firebase (Google, email link, etc.)
// Frontend sends Firebase ID Token → we return admin profile
router.post("/auth/firebase-login",       validate(schemas.firebaseLogin),                                  firebaseLogin);
// Link Firebase to existing local account (must be logged in via JWT)
router.post("/auth/firebase-link",        verifyAdmin,               validate(schemas.firebaseLogin),       firebaseLink);

// =====================================================
// DASHBOARD
// =====================================================
router.get("/admin/dashboard/stats", verifyAdmin, getDashboardStats);

// =====================================================
// ANALYTICS
// =====================================================
router.get("/admin/analytics/overview",     verifyAdmin, getAnalyticsOverview);
router.get("/admin/analytics/revenue",      verifyAdmin, getDailyRevenue);
router.get("/admin/analytics/orders",       verifyAdmin, getOrdersByStatus);
router.get("/admin/analytics/top-products", verifyAdmin, getTopProducts);
router.get("/admin/analytics/categories",   verifyAdmin, getSalesByCategory);

// =====================================================
// PRODUCTS  (admin-only)
// =====================================================
router.get   ("/admin/products/low-stock",           verifyAdmin, getLowStockProducts);
router.get   ("/admin/products",                     verifyAdmin, getProducts);
router.post  ("/admin/products",                     verifyAdmin, upload.array("images", 5), validate(schemas.createProduct), createProduct);
router.get   ("/admin/products/:id",                 verifyAdmin, getProductById);
router.put   ("/admin/products/:id",                 verifyAdmin, upload.array("images", 5), updateProduct);
router.patch ("/admin/products/:id/status",          verifyAdmin, updateProductStatus);
router.patch ("/admin/products/:id/stock",           verifyAdmin, validate(schemas.adjustStock), adjustStock);
router.delete("/admin/products/:id",                 verifyAdmin, deleteProduct);
// Variants
router.post  ("/admin/products/:id/variants",              verifyAdmin, addVariant);
router.put   ("/admin/products/:id/variants/:variantId",   verifyAdmin, updateVariant);
router.delete("/admin/products/:id/variants/:variantId",   verifyAdmin, deleteVariant);

// =====================================================
// ORDERS
// POST /orders is public — guest checkout
// =====================================================
router.post  ("/orders",                    validate(schemas.createOrder), createOrder);
router.get   ("/admin/orders",              verifyAdmin, getAllOrders);
router.get   ("/admin/orders/:id",          verifyAdmin, getOrderById);
router.patch ("/admin/orders/:id/status",   verifyAdmin, validate(schemas.updateOrderStatus), updateOrderStatus);
router.patch ("/admin/orders/:id/payment",  verifyAdmin, updateOrderPayment);
router.patch ("/admin/orders/:id/tracking", verifyAdmin, addTrackingNumber);
router.patch ("/admin/orders/:id/notes",    verifyAdmin, updateAdminNotes);
router.delete("/admin/orders/:id",          verifyAdmin, deleteOrder);

// =====================================================
// CUSTOMERS
// =====================================================
router.get   ("/admin/customers/stats",    verifyAdmin, getCustomerStats);
router.get   ("/admin/customers",          verifyAdmin, getAllCustomers);
router.get   ("/admin/customers/:id",      verifyAdmin, getCustomerById);
router.patch ("/admin/customers/:id/tags", verifyAdmin, updateCustomerTags);
router.patch ("/admin/customers/:id/notes",verifyAdmin, updateCustomerNotes);
router.patch ("/admin/customers/:id/block",verifyAdmin, toggleBlockCustomer);
router.delete("/admin/customers/:id",      verifyAdmin, deleteCustomer);

// =====================================================
// TRANSACTIONS
// POST /transactions — payment gateway webhook (Paystack only)
// Guarded by HMAC signature verification to prevent fake "Success" posts.
// =====================================================
router.post  ("/transactions",                          verifyPaystackWebhook, createTransaction);
router.get   ("/admin/transactions/summary",            verifyAdmin, getTransactionSummary);
router.get   ("/admin/transactions/order/:orderId",     verifyAdmin, getTransactionsByOrder);
router.get   ("/admin/transactions",                    verifyAdmin, getAllTransactions);
router.get   ("/admin/transactions/:id",                verifyAdmin, getTransactionById);
router.patch ("/admin/transactions/:id/refund",         verifyAdmin, refundTransaction);

// =====================================================
// INVOICES
// =====================================================
router.get   ("/admin/invoices/summary",    verifyAdmin, getInvoiceSummary);
router.get   ("/admin/invoices/overdue",    verifyAdmin, getOverdueInvoices);
router.get   ("/admin/invoices",            verifyAdmin, getAllInvoices);
router.get   ("/admin/invoices/:id",        verifyAdmin, getInvoiceById);
router.patch ("/admin/invoices/:id/status", verifyAdmin, updateInvoiceStatus);

// =====================================================
// CATEGORIES
// =====================================================
router.get   ("/categories",          cat.getAllCategories);          // public
router.get   ("/categories/:id",      cat.getCategoryById);           // public
router.get   ("/admin/categories",    verifyAdmin, cat.getAllCategories);
router.post  ("/admin/categories",    verifyAdmin, upload.single("image"), cat.createCategory);
router.put   ("/admin/categories/:id",verifyAdmin, upload.single("image"), cat.updateCategory);
router.delete("/admin/categories/:id",verifyAdmin, cat.deleteCategory);

// =====================================================
// COUPONS
// POST /coupons/validate is public — called at checkout
// =====================================================
router.post  ("/coupons/validate",        validate(schemas.validateCoupon), coup.validateCoupon);
router.get   ("/admin/coupons",           verifyAdmin, coup.getAllCoupons);
router.post  ("/admin/coupons",           verifyAdmin, validate(schemas.createCoupon), coup.createCoupon);
router.get   ("/admin/coupons/:id",       verifyAdmin, coup.getCouponById);
router.put   ("/admin/coupons/:id",       verifyAdmin, coup.updateCoupon);
router.patch ("/admin/coupons/:id/toggle",verifyAdmin, coup.toggleCoupon);
router.delete("/admin/coupons/:id",       verifyAdmin, coup.deleteCoupon);

// =====================================================
// REVIEWS
// POST /reviews is public — customers submit reviews
// =====================================================
router.post  ("/reviews",                     validate(schemas.createReview), rev.submitReview);
router.get   ("/reviews/product/:productId",  rev.getProductReviews);
router.get   ("/admin/reviews/pending",       verifyAdmin, rev.getPendingReviews);
router.get   ("/admin/reviews",               verifyAdmin, rev.getAllReviews);
router.patch ("/admin/reviews/:id/approve",   verifyAdmin, rev.approveReview);
router.patch ("/admin/reviews/:id/reply",     verifyAdmin, rev.replyToReview);
router.delete("/admin/reviews/:id",           verifyAdmin, rev.deleteReview);

// =====================================================
// ADMIN ACCOUNTS
// =====================================================
router.get   ("/admin/accounts",                    verifyAdmin, requireSuperAdmin, adm.getAllAdmins);
router.post  ("/admin/accounts",                    verifyAdmin, requireSuperAdmin, validate(schemas.register), adm.createAdmin);
router.get   ("/admin/accounts/:id",                verifyAdmin, adm.getAdminById);
router.patch ("/admin/accounts/:id",                verifyAdmin, upload.single("avatar"), adm.updateAdmin);
router.patch ("/admin/accounts/:id/password",       verifyAdmin, adm.changePassword);
router.patch ("/admin/accounts/:id/deactivate",     verifyAdmin, requireSuperAdmin, adm.deactivateAdmin);
router.delete("/admin/accounts/:id",                verifyAdmin, requireSuperAdmin, adm.deleteAdmin);
router.get   ("/admin/accounts/:id/logs",           verifyAdmin, adm.getAdminActivityLog);

// =====================================================
// NOTIFICATIONS
// =====================================================
router.get   ("/admin/notifications/unread-count", verifyAdmin, notif.getUnreadCount);
router.patch ("/admin/notifications/read-all",     verifyAdmin, notif.markAllRead);
router.delete("/admin/notifications/clear-read",   verifyAdmin, notif.clearReadNotifications);
router.get   ("/admin/notifications",              verifyAdmin, notif.getNotifications);
router.patch ("/admin/notifications/:id/read",     verifyAdmin, notif.markOneRead);
router.delete("/admin/notifications/:id",          verifyAdmin, notif.deleteNotification);

// =====================================================
// SETTINGS
// =====================================================
router.get   ("/admin/settings",              verifyAdmin, sett.getSettings);
router.patch ("/admin/settings",              verifyAdmin, upload.single("logo"), sett.updateSettings);
router.post  ("/admin/settings/maintenance",  verifyAdmin, requireSuperAdmin, sett.toggleMaintenanceMode);

// =====================================================
// BULK OPERATIONS
// =====================================================
router.patch ("/admin/bulk/orders/status",    verifyAdmin, validate(schemas.bulkUpdateOrders), bulk.bulkUpdateOrderStatus);
router.patch ("/admin/bulk/products/status",  verifyAdmin, bulk.bulkUpdateProductStatus);
router.patch ("/admin/bulk/products/stock",   verifyAdmin, bulk.bulkRestockProducts);
router.delete("/admin/bulk/products",         verifyAdmin, validate(schemas.bulkDeleteProducts), bulk.bulkDeleteProducts);
router.patch ("/admin/bulk/invoices/status",  verifyAdmin, bulk.bulkUpdateInvoiceStatus);

// =====================================================
// CSV EXPORT
// =====================================================
router.get("/admin/export/orders",        verifyAdmin, exp.exportOrders);
router.get("/admin/export/transactions",  verifyAdmin, exp.exportTransactions);
router.get("/admin/export/products",      verifyAdmin, exp.exportProducts);
router.get("/admin/export/invoices",      verifyAdmin, exp.exportInvoices);
router.get("/admin/export/customers",     verifyAdmin, exp.exportCustomers);

// =====================================================
// GLOBAL SEARCH
// =====================================================
router.get("/admin/search", verifyAdmin, srch.globalSearch);

// ── HEALTH CHECK ─────────────────────────────────
router.get("/health", (req, res) => res.status(200).json({ success: true, uptime: process.uptime() }));

module.exports = router;