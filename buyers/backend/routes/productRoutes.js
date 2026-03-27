// =====================================================
// routes/productRoutes.js
// Specialized shop filters and guides.
// =====================================================

const express = require("express");
const router = express.Router();
const {
  getProducts,
  searchSuggestions,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getProductById,
  getRelatedProducts,
  getCategories,
  getByCategory,
  getSizeGuides,
} = require("../controllers/productController");

// --- SHOP BROWSE ---
router.get("/",               getProducts);
router.get("/search",         searchSuggestions);
router.get("/featured",       getFeaturedProducts);
router.get("/new-arrivals",   getNewArrivals);
router.get("/best-sellers",   getBestSellers);
router.get("/categories",     getCategories);
router.get("/category/:slug", getByCategory);

// --- GUIDES & DETAILS ---
router.get("/guides",         getSizeGuides); // Size & shade matching
router.get("/:id",            getProductById);
router.get("/:id/related",    getRelatedProducts);

module.exports = router;
