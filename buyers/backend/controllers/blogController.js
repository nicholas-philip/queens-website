// =====================================================
// controllers/blogController.js
// =====================================================

const Blog    = require("../models/Blog")
const Product = require("../models/Product")

// GET /api/blog
const getPosts = async (req, res) => {
  const { category, tag, page = 1, limit = 9 } = req.query
  const filter = { isPublished: true }
  if (category) filter.category = category
  if (tag)      filter.tags     = { $in: [tag] }

  const pg   = Math.max(parseInt(page), 1)
  const lim  = Math.min(parseInt(limit), 24)
  const skip = (pg - 1) * lim

  const [data, total] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(lim)
      .select("title slug excerpt coverImage category tags author publishedAt readTimeMin viewCount"),
    Blog.countDocuments(filter),
  ])

  res.status(200).json({
    success: true, data,
    pagination: { total, page: pg, totalPages: Math.ceil(total / lim) },
  })
}

// GET /api/blog/:slug
const getPostBySlug = async (req, res) => {
  const post = await Blog.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { viewCount: 1 } },        // increment view count
    { new: true }
  ).populate("featuredProducts", "title price discountPrice images SKU averageRating")

  if (!post) return res.status(404).json({ success: false, message: "Post not found." })

  // Related posts (same category, different post)
  const related = await Blog.find({
    isPublished: true,
    category:    post.category,
    _id:         { $ne: post._id },
  })
    .limit(3)
    .select("title slug excerpt coverImage publishedAt readTimeMin")

  res.status(200).json({ success: true, post, relatedPosts: related })
}

// GET /api/blog/categories — unique blog categories in use
const getBlogCategories = async (req, res) => {
  const cats = await Blog.distinct("category", { isPublished: true })
  res.status(200).json({ success: true, categories: cats })
}

const blogController = { getPosts, getPostBySlug, getBlogCategories }


// =====================================================
// controllers/faqController.js
// =====================================================

const FAQ = require("../models/FAQ")

// GET /api/faq  (?category=Shipping)
const getFAQs = async (req, res) => {
  const { category } = req.query
  const filter = { isActive: true }
  if (category) filter.category = category

  const faqs = await FAQ.find(filter).sort({ category: 1, sortOrder: 1 }).select("-__v")
  res.status(200).json({ success: true, count: faqs.length, faqs })
}

// GET /api/faq/categories — all unique categories that have FAQs
const getFAQCategories = async (req, res) => {
  const cats = await FAQ.distinct("category", { isActive: true })
  res.status(200).json({ success: true, categories: cats })
}

// PATCH /api/faq/:id/view — track which FAQs are most viewed
const recordFAQView = async (req, res) => {
  await FAQ.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } })
  res.status(200).json({ success: true })
}

const faqController = { getFAQs, getFAQCategories, recordFAQView }


// =====================================================
// controllers/shippingController.js
// =====================================================

const ShippingZone = require("../models/ShippingZone")

// GET /api/shipping/zones — list all active zones
const getShippingZones = async (req, res) => {
  const zones = await ShippingZone.find({ isActive: true })
    .sort({ shippingFee: 1 })
    .select("name states cities shippingFee freeShippingAbove estimatedDays")
  res.status(200).json({ success: true, zones })
}

// POST /api/shipping/calculate
// Body: { state, city, orderTotal }
// Returns the applicable zone and fee
const calculateShipping = async (req, res) => {
  const { state, city, orderTotal = 0 } = req.body
  if (!state) return res.status(400).json({ success: false, message: "State is required." })

  const stateLC = state.toLowerCase().trim()
  const cityLC  = city?.toLowerCase().trim() || ""

  // Find matching zone — city match takes priority over state match
  let zone = await ShippingZone.findOne({
    isActive: true,
    cities:   { $regex: cityLC, $options: "i" },
  })

  if (!zone) {
    zone = await ShippingZone.findOne({
      isActive: true,
      states:   { $regex: stateLC, $options: "i" },
    })
  }

  if (!zone) {
    // Return the most expensive / "rest of Ghana" zone
    zone = await ShippingZone.findOne({ isActive: true }).sort({ shippingFee: -1 })
  }

  if (!zone) {
    return res.status(200).json({
      success: true, fee: 0, isFree: false, estimatedDays: "3-7 business days",
      message: "Shipping fee will be calculated at checkout.",
    })
  }

  const fee    = zone.calculateFee(Number(orderTotal))
  const isFree = fee === 0

  res.status(200).json({
    success: true,
    zone:    zone.name,
    fee,
    isFree,
    estimatedDays:     zone.estimatedDays,
    freeShippingAbove: zone.freeShippingAbove,
    message: isFree
      ? "🎉 You qualify for free shipping!"
      : `Shipping to ${state}: GHS ${fee.toLocaleString()} (${zone.estimatedDays})`,
  })
}

const shippingController = { getShippingZones, calculateShipping }

module.exports = { blogController, faqController, shippingController }