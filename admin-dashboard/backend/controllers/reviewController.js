// =====================================================
// controllers/reviewController.js
// Customer review moderation for the admin dashboard.
//
// POST   /reviews                        — public: submit review
// GET    /reviews/product/:productId     — public: get approved reviews
// GET    /admin/reviews/pending          — list pending reviews
// GET    /admin/reviews                  — list all reviews
// PATCH  /admin/reviews/:id/approve      — approve a review
// PATCH  /admin/reviews/:id/reply        — add admin reply
// DELETE /admin/reviews/:id              — delete a review
// =====================================================

const Review       = require("../models/Review");
const Product      = require("../models/Product");
const Notification = require("../models/Notification");
const logActivity  = require("../middleware/activityLogger");
const filterQuery  = require("../utils/filterQuery");

const submitReview = async (req, res) => {
  const { productId, customerName, customerEmail, rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  if (customerEmail) {
    const already = await Review.findOne({ productId, customerEmail });
    if (already) return res.status(400).json({ success: false, message: "You already reviewed this product." });
  }
  const review = await Review.create({ productId, customerName, customerEmail: customerEmail || "", rating, comment, ipAddress: req.ip || "" });
  await Notification.notify("NEW_REVIEW", `${customerName} left a ${rating}★ review on "${product.title}"`);
  res.status(201).json({ success: true, message: "Review submitted and awaiting approval.", review: { customerName: review.customerName, rating: review.rating, comment: review.comment } });
};

const getProductReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 10, skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ productId: req.params.productId, isApproved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).select("customerName rating comment adminReply createdAt"),
    Review.countDocuments({ productId: req.params.productId, isApproved: true }),
  ]);
  res.status(200).json({ success: true, total, reviews, pagination: { page, totalPages: Math.ceil(total / limit) } });
};

const getAllReviews = async (req, res) => {
  const result = await filterQuery(Review, req.query, ["isApproved"]);
  res.status(200).json({ success: true, ...result });
};

const getPendingReviews = async (req, res) => {
  const reviews = await Review.find({ isApproved: false }).sort({ createdAt: -1 }).populate("productId", "title images SKU");
  res.status(200).json({ success: true, count: reviews.length, reviews });
};

const approveReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  review.isApproved = true;
  await review.save();
  await Review.updateProductRating(review.productId);
  await logActivity(req, "APPROVED_REVIEW", `By: ${review.customerName}`, `Rating: ${review.rating}/5`);
  res.status(200).json({ success: true, message: "Review approved and now visible.", review });
};

const replyToReview = async (req, res) => {
  const { reply } = req.body;
  if (!reply?.trim()) return res.status(400).json({ success: false, message: "Reply text is required." });
  const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: { text: reply.trim(), repliedAt: new Date() } }, { new: true });
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  res.status(200).json({ success: true, message: "Reply posted.", adminReply: review.adminReply });
};

const deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  await Review.updateProductRating(review.productId);
  await logActivity(req, "DELETED_REVIEW", `By: ${review.customerName}`);
  res.status(200).json({ success: true, message: "Review deleted. Product rating recalculated." });
};

module.exports = { submitReview, getProductReviews, getAllReviews, getPendingReviews, approveReview, replyToReview, deleteReview };
