// =====================================================
// controllers/reviewController.js
// Product reviews, Newsletter, Contact form, Wishlist
// =====================================================

const Review     = require("../models/Review");
const Product    = require("../models/Product");
const Newsletter = require("../models/Newsletter");
const ContactMessage = require("../models/contactMessage");
const Wishlist   = require("../models/Wishlist");
const Notification = require("../models/Notification");

// --- REVIEWS ---
const submitReview = async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing required review fields." });
    }
    const product = await Product.findById(productId);
    if (!product || product.status !== "Active") return res.status(404).json({ success: false, message: "Product not found." });
    await Review.create({ productId, customerName, customerEmail, rating, comment, ipAddress: req.ip });
    await Notification.push("NEW_REVIEW", "New Review Pending", `${customerName} rated "${product.title}" ${rating}★`, "/admin/reviews");
    res.status(201).json({ success: true, message: "Review submitted for moderation! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId, isApproved: true }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- NEWSLETTER ---
const subscribe = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    const exists = await Newsletter.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(200).json({ success: true, message: "You're already subscribed! 💋" });
    await Newsletter.create({ email, firstName, isVerified: true });
    res.status(201).json({ success: true, message: "Welcome to the family! 💋" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    await Newsletter.findOneAndUpdate({ email: req.query.email?.toLowerCase() }, { isActive: false });
    res.status(200).json({ success: true, message: "Successfully unsubscribed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- CONTACT FORM ---
const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ success: false, message: "All fields are required." });
    await ContactMessage.create({ name, email, subject, message, ipAddress: req.ip });
    await Notification.push("CRM_ALERT", "New Contact Inquiry", `${name} sent a message: ${subject.substring(0, 30)}...`, "/admin/contacts");
    res.status(201).json({ success: true, message: "Message sent! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- WISHLIST ---
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ sessionId: req.params.id }).populate({ path: "items.productId", select: "title price images status" });
    res.status(200).json({ success: true, items: (wishlist?.items || []).filter(i => i.productId?.status === "Active") });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ sessionId: req.params.id });
    if (!wishlist) wishlist = new Wishlist({ sessionId: req.params.id, items: [] });
    const idx = wishlist.items.findIndex(i => i.productId.toString() === req.body.productId);
    if (idx > -1) wishlist.items.splice(idx, 1);
    else wishlist.items.push({ productId: req.body.productId });
    await wishlist.save();
    res.status(200).json({ success: true, count: wishlist.items.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ sessionId: req.params.id });
    res.status(200).json({ success: true, message: "Wishlist cleared." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  reviewController: { submitReview, getProductReviews },
  newsletterController: { subscribe, unsubscribe },
  contactController: { sendMessage },
  wishlistController: { getWishlist, toggleWishlist, clearWishlist }
};