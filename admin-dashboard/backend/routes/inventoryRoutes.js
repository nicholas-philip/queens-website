const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyAdmin");

const { 
  categoryController, 
  couponController, 
  reviewController 
} = require("../controllers/categoryController");

// --- CATEGORIES ---
router.get("/categories", categoryController.getAllCategories);
router.post("/categories", verifyAdmin, categoryController.createCategory);
router.delete("/categories/:id", verifyAdmin, categoryController.deleteCategory);

// --- COUPONS ---
router.get("/coupons", verifyAdmin, couponController.getAllCoupons);
router.post("/coupons", verifyAdmin, couponController.createCoupon);
router.post("/coupons/validate", couponController.validateCoupon);

// --- REVIEWS ---
router.get("/reviews/pending", verifyAdmin, reviewController.getPendingReviews);
router.patch("/reviews/:id/approve", verifyAdmin, reviewController.approveReview);
router.post("/reviews", reviewController.submitReview); // Public

module.exports = router;
