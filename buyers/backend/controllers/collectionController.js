// =====================================================
// controllers/collectionController.js
// Handles: Collections, Flash Sales, Banners, Bundles
// =====================================================

const Collection   = require("../models/Collection")
const FlashSale    = require("../models/FlashSale")
const Banner       = require("../models/Banner")
const ProductBundle= require("../models/ProductBundle")
const Product      = require("../models/Product")

// ── COLLECTIONS ────────────────────────────────────

// GET /api/collections
const getCollections = async (req, res) => {
  const { featured } = req.query
  const filter = { isActive: true }
  if (featured === "true") filter.isFeatured = true

  const collections = await Collection.find(filter)
    .sort({ createdAt: -1 })
    .select("title slug description subtitle coverImage tags isFeatured")

  res.status(200).json({ success: true, count: collections.length, collections })
}

// GET /api/collections/:slug
const getCollectionBySlug = async (req, res) => {
  const col = await Collection.findOne({ slug: req.params.slug, isActive: true })

  if (!col) return res.status(404).json({ success: false, message: "Collection not found." })

  // Populate products in the collection
  await col.populate({
    path:   "products.productId",
    select: "title price discountPrice images SKU averageRating reviewCount status stockQuantity",
    match:  { status: "Active" },
  })

  // Filter out any deactivated products
  const activeProducts = col.products
    .filter(p => p.productId !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  res.status(200).json({
    success: true,
    collection: {
      _id:         col._id,
      title:       col.title,
      slug:        col.slug,
      description: col.description,
      subtitle:    col.subtitle,
      coverImage:  col.coverImage,
      bannerImages:col.bannerImages,
      tags:        col.tags,
    },
    products:    activeProducts.map(p => p.productId),
    count:       activeProducts.length,
  })
}

// ── FLASH SALES ────────────────────────────────────

// GET /api/flash-sales/active
// Returns currently running flash sale with discounted products
const getActiveFlashSale = async (req, res) => {
  const now = new Date()
  const sale = await FlashSale.findOne({
    isActive:  true,
    startDate: { $lte: now },
    endDate:   { $gte: now },
  })
    .populate("products",   "title price discountPrice images SKU averageRating status stockQuantity")
    .populate("categories", "name slug")

  if (!sale) {
    return res.status(200).json({ success: true, sale: null, message: "No active flash sale." })
  }

  // Calculate discounted price for each product
  const discountedProducts = (sale.products || [])
    .filter(p => p.status === "Active")
    .map(p => {
      const base     = p.discountPrice ?? p.price
      const discount = sale.discountType === "percentage"
        ? Math.round(base * (sale.discountValue / 100))
        : sale.discountValue
      return {
        ...p.toObject(),
        salePrice:    Math.max(base - discount, 0),
        savedAmount:  discount,
        salePercent:  sale.discountValue,
        saleDiscountType: sale.discountType,
      }
    })

  const timeLeft = Math.max(0, new Date(sale.endDate) - now)

  res.status(200).json({
    success: true,
    sale: {
      _id:         sale._id,
      title:       sale.title,
      description: sale.description,
      bannerImage: sale.bannerImage,
      endDate:     sale.endDate,
      startDate:   sale.startDate,
      timeLeftMs:  timeLeft,
      discountType: sale.discountType,
      discountValue:sale.discountValue,
    },
    products:  discountedProducts,
    categories:sale.categories,
  })
}

// ── BANNERS ────────────────────────────────────────

// GET /api/banners?type=hero
const getBanners = async (req, res) => {
  const { type } = req.query
  const now    = new Date()
  const filter = {
    isActive: true,
    $or: [
      { startDate: null },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ],
  }
  if (type) filter.type = type

  const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 })
  res.status(200).json({ success: true, count: banners.length, banners })
}

// ── BUNDLES ────────────────────────────────────────

// GET /api/bundles
const getBundles = async (req, res) => {
  const { giftSet } = req.query
  const filter = { status: "Active" }
  if (giftSet === "true") filter.isGiftSet = true

  const bundles = await ProductBundle.find(filter)
    .populate({ path: "products.productId", select: "title images price discountPrice status stockQuantity" })
    .populate("category", "name slug")
    .sort({ isFeatured: -1, createdAt: -1 })

  res.status(200).json({ success: true, count: bundles.length, bundles })
}

// GET /api/bundles/:slug
const getBundleBySlug = async (req, res) => {
  const bundle = await ProductBundle.findOne({ slug: req.params.slug, status: "Active" })
    .populate({ path: "products.productId", select: "title images price discountPrice SKU status stockQuantity averageRating" })
    .populate("category", "name slug")

  if (!bundle) return res.status(404).json({ success: false, message: "Bundle not found." })

  res.status(200).json({ success: true, bundle })
}

module.exports = { getCollections, getCollectionBySlug, getActiveFlashSale, getBanners, getBundles, getBundleBySlug }