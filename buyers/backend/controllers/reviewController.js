// =====================================================
// controllers/reviewController.js  —  CLEANED
// Product reviews management.
// =====================================================

const Review     = require("../models/Review");
const Product    = require("../models/Product");
const Notification = require("../models/Notification");

const submitReview = async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing required review fields." });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== "Active") {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await Review.create({ 
      productId, customerName, customerEmail, 
      rating, comment, ipAddress: req.ip 
    });

    // Notify Admin
    await Notification.push(
      "NEW_REVIEW", 
      "New Review Pending", 
      `${customerName} rated "${product.title}" ${rating}★`, 
      "/admin/reviews"
    );

    res.status(201).json({ success: true, message: "Review submitted for moderation! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitReview, getProductReviews };