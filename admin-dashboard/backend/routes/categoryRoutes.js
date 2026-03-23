const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");

// Importing multiple controllers from categoryController.js
const { 
  categoryController, 
  couponController, 
  reviewController 
} = require("../controllers/categoryController");

// --- CATEGORIES ---
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", verifyAdmin, categoryController.createCategory);
router.patch("/:id", verifyAdmin, categoryController.updateCategory);
router.delete("/:id", verifyAdmin, categoryController.deleteCategory);

// --- COUPONS ---
router.get("/coupons/all", verifyAdmin, couponController.getAllCoupons);
router.post("/coupons", verifyAdmin, couponController.createCoupon);
router.post("/coupons/validate", couponController.validateCoupon);
router.patch("/coupons/:id/toggle", verifyAdmin, couponController.toggleCoupon);

// --- REVIEWS ---
router.get("/reviews", verifyAdmin, reviewController.getAllReviews);
router.get("/reviews/pending", verifyAdmin, reviewController.getPendingReviews);
router.patch("/reviews/:id/approve", verifyAdmin, reviewController.approveReview);
router.post("/reviews/submit", reviewController.submitReview);

module.exports = router;
