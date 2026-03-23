// =====================================================
// controllers/categoryController.js
// =====================================================

const Category    = require("../models/Category");
const Product     = require("../models/Product");
const logActivity = require("../middleware/activityLogger");
const { uploadToCloudinary } = require("../utils/Cloudinaryupload");


const getAllCategories = async (req, res) => {
  const filter = {};
  if (req.query.active === "true") filter.isActive = true;
  const categories = await Category.find(filter).sort({ name: 1 }).select("-__v");
  res.status(200).json({ success: true, count: categories.length, categories });
};

const getCategoryById = async (req, res) => {
  const cat = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  const products = await Product.find({ category: cat._id, status: "Active" }).limit(12).select("title price discountPrice images SKU totalSold");
  res.status(200).json({ success: true, category: cat, products });
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Category name is required." });
  const exists = await Category.findOne({ name: name.trim() });
  if (exists) return res.status(400).json({ success: false, message: `Category "${name}" already exists.` });

  let image = null;
  if (req.file) image = await uploadToCloudinary(req.file.buffer, "categories");

  const cat = await Category.create({ name, description, image });
  await logActivity(req, "CREATED_CATEGORY", `Category: ${cat.name}`);
  res.status(201).json({ success: true, message: `Category "${cat.name}" created.`, category: cat });
};

const updateCategory = async (req, res) => {
  const updates = {};
  ["name","description","isActive"].forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (req.file) updates.image = await uploadToCloudinary(req.file.buffer, "categories");

  const cat = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  await logActivity(req, "UPDATED_CATEGORY", `Category: ${cat.name}`);
  res.status(200).json({ success: true, message: "Category updated.", category: cat });
};

const deleteCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  const count = await Product.countDocuments({ category: cat._id });
  if (count > 0) return res.status(400).json({ success: false, message: `Cannot delete — ${count} product(s) still use this category.` });
  await cat.deleteOne();
  await logActivity(req, "DELETED_CATEGORY", `Category: ${cat.name}`);
  res.status(200).json({ success: true, message: `Category "${cat.name}" deleted.` });
};

const categoryController = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };


// =====================================================
// controllers/couponController.js
// =====================================================

const Coupon = require("../models/Coupon");

const validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found.", isValid: false });
  const check = coupon.isValid(orderTotal);
  if (!check.valid) return res.status(400).json({ success: false, message: check.reason, isValid: false });
  const discountAmount = coupon.calculateDiscount(orderTotal);
  res.status(200).json({
    success: true, isValid: true, couponCode: coupon.code,
    discountType: coupon.discountType, discountValue: coupon.discountValue,
    discountAmount, originalTotal: orderTotal, newTotal: orderTotal - discountAmount,
    message: `Coupon applied! You save ₦${discountAmount.toLocaleString()}.`,
  });
};

const getAllCoupons = async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  const now     = new Date();
  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  const enriched = coupons.map((c) => ({
    ...c.toObject(),
    isExpired:     now > c.expiryDate,
    remainingUses: c.maxUses ? c.maxUses - c.usedCount : "Unlimited",
  }));
  res.status(200).json({ success: true, count: coupons.length, coupons: enriched });
};

const getCouponById = async (req, res) => {
  const c = await Coupon.findById(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: "Coupon not found." });
  res.status(200).json({ success: true, coupon: c });
};

const createCoupon = async (req, res) => {
  const { code } = req.body;
  const exists = await Coupon.findOne({ code: code?.trim().toUpperCase() });
  if (exists) return res.status(400).json({ success: false, message: `Coupon "${code}" already exists.` });
  const coupon = await Coupon.create(req.body);
  await logActivity(req, "CREATED_COUPON", `Coupon: ${coupon.code}`, `${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : "₦"} off`);
  res.status(201).json({ success: true, message: `Coupon "${coupon.code}" created.`, coupon });
};

const updateCoupon = async (req, res) => {
  if (req.body.code) return res.status(400).json({ success: false, message: "Coupon code cannot be changed." });
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  await logActivity(req, "UPDATED_COUPON", `Coupon: ${coupon.code}`);
  res.status(200).json({ success: true, message: "Coupon updated.", coupon });
};

const toggleCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  const state = coupon.isActive ? "activated" : "deactivated";
  await logActivity(req, "TOGGLED_COUPON", `Coupon: ${coupon.code}`, `Now ${state}`);
  res.status(200).json({ success: true, message: `Coupon "${coupon.code}" ${state}.`, isActive: coupon.isActive });
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  await logActivity(req, "DELETED_COUPON", `Coupon: ${coupon.code}`);
  res.status(200).json({ success: true, message: `Coupon "${coupon.code}" deleted.` });
};

const couponController = { validateCoupon, getAllCoupons, getCouponById, createCoupon, updateCoupon, toggleCoupon, deleteCoupon };


// =====================================================
// controllers/reviewController.js
// =====================================================

const Review  = require("../models/Review");
const Notification2 = require("../models/Notification");
const filterQuery   = require("../utils/filterQuery");

const submitReview = async (req, res) => {
  const { productId, customerName, customerEmail, rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  if (customerEmail) {
    const already = await Review.findOne({ productId, customerEmail });
    if (already) return res.status(400).json({ success: false, message: "You already reviewed this product." });
  }
  const review = await Review.create({ productId, customerName, customerEmail: customerEmail || "", rating, comment, ipAddress: req.ip || "" });
  await Notification2.notify("NEW_REVIEW", `${customerName} left a ${rating}★ review on "${product.title}"`);
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

const reviewController = { submitReview, getProductReviews, getAllReviews, getPendingReviews, approveReview, replyToReview, deleteReview };

module.exports = { categoryController, couponController, reviewController };