// =====================================================
// controllers/productController.js (Storefront)
//
// GET /api/products              — shop page (filter, search, paginate)
// GET /api/products/search       — search suggestions
// GET /api/products/featured     — featured products
// GET /api/products/new-arrivals — newest products
// GET /api/products/best-sellers — most sold
// GET /api/products/:id          — single product detail
// GET /api/products/guides       — size & shade guides
// =====================================================

const Product   = require("../models/Product");
const Category  = require("../models/Category");
const Review    = require("../models/Review");
const SizeGuide = require("../models/SizeGuide");

// Product fields safe to expose publicly
const PUBLIC_FIELDS =
  "title description price discountPrice images SKU averageRating reviewCount " +
  "totalSold tags status stockQuantity hasVariants variants category metadata";

// ── Shop page ─────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      sortBy = "createdAt", sortOrder = "desc",
      page = 1, limit = 12, tags,
    } = req.query;

    const filter = { status: "Active" };

    if (category) {
      const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category }] });
      if (cat) filter.category = cat._id;
      else return res.status(200).json({ success: true, data: [], pagination: { total: 0 } });
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
        { SKU:         { $regex: search, $options: "i" } },
      ];
    }

    const pg   = Math.max(parseInt(page), 1);
    const lim  = Math.min(parseInt(limit), 48);
    const skip = (pg - 1) * lim;

    const sortMap = {
      createdAt: "createdAt", price: "price",
      rating: "averageRating", popular: "totalSold",
      title: "title",
    };
    const sortField = sortMap[sortBy] || "createdAt";
    const sortDir   = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(lim)
        .select(PUBLIC_FIELDS),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total, page: pg, limit: lim,
        totalPages: Math.ceil(total / lim),
        hasNext: pg < Math.ceil(total / lim),
        hasPrev: pg > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Search suggestions ────────────────────────────
const searchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }
    const regex = { $regex: q.trim(), $options: "i" };
    const products = await Product.find({
      status: "Active",
      $or: [{ title: regex }, { tags: regex }],
    }).limit(8).select("title images price discountPrice SKU averageRating");
    res.status(200).json({ success: true, suggestions: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ status: "Active", tags: "featured" }).limit(12).populate("category", "name slug").select(PUBLIC_FIELDS);
  res.status(200).json({ success: true, count: products.length, data: products });
};

const getNewArrivals = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 24);
  const products = await Product.find({ status: "Active" }).sort({ createdAt: -1 }).limit(limit).populate("category", "name slug").select(PUBLIC_FIELDS);
  res.status(200).json({ success: true, count: products.length, data: products });
};

const getBestSellers = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 24);
  const products = await Product.find({ status: "Active" }).sort({ totalSold: -1 }).limit(limit).populate("category", "name slug").select(PUBLIC_FIELDS);
  res.status(200).json({ success: true, count: products.length, data: products });
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: "Active" }).populate("category", "name slug description").select(PUBLIC_FIELDS);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const reviews = await Review.find({ productId: product._id, isApproved: true }).sort({ createdAt: -1 }).limit(20).select("customerName rating comment adminReply createdAt");
    res.status(200).json({ success: true, product, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id).select("category tags");
  if (!product) return res.status(404).json({ success: false, message: "Not found." });
  const related = await Product.find({ status: "Active", _id: { $ne: product._id }, $or: [{ category: product.category }, { tags: { $in: product.tags || [] } }] }).limit(6).populate("category", "name slug").select(PUBLIC_FIELDS);
  res.status(200).json({ success: true, count: related.length, data: related });
};

const getCategories = async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ productCount: -1 }).select("name slug image productCount description");
  res.status(200).json({ success: true, count: cats.length, categories: cats });
};

const getByCategory = async (req, res) => {
  try {
    const cat = await Category.findOne({ $or: [{ slug: req.params.slug }, { _id: req.params.slug }], isActive: true });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 48);
    const skip  = (page - 1) * limit;
    const filter = { status: "Active", category: cat._id };
    const [data, total] = await Promise.all([
      Product.find(filter).populate("category", "name slug").sort({ totalSold: -1, createdAt: -1 }).skip(skip).limit(limit).select(PUBLIC_FIELDS),
      Product.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, category: cat, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Size Guides ──────────────────────────────────
const getSizeGuides = async (req, res) => {
  try {
    const guides = await SizeGuide.find({ isActive: true }).sort({ sortOrder: 1 });
    res.status(200).json({ success: true, guides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts, searchSuggestions, getFeaturedProducts,
  getNewArrivals, getBestSellers, getProductById,
  getRelatedProducts, getCategories, getByCategory,
  getSizeGuides,
};