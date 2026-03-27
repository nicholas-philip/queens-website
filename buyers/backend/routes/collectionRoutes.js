// =====================================================
// routes/collectionRoutes.js
// Curated collections, flash sales and banners.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  getCollections, 
  getCollectionBySlug, 
  getActiveFlashSale, 
  getBanners, 
  getBundles, 
  getBundleBySlug 
} = require("../controllers/collectionController");

// --- COLLECTIONS & LOOKBOOKS ---
router.get("/",           getCollections);    // Browse lists
router.get("/:slug",      getCollectionBySlug); // Single lookbook

// --- PROMOS & BUNDLES ---
router.get("/promo/flash", getActiveFlashSale); // Real-time discount timer
router.get("/promo/banners", getBanners);      // Rotating sliders
router.get("/promo/bundles", getBundles);      // Gift sets list
router.get("/promo/bundle/:slug", getBundleBySlug); // Gift set detail

module.exports = router;
