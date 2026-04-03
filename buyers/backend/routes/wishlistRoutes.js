// =====================================================
// routes/wishlistRoutes.js
// Guest favorite management.
// =====================================================

const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist, clearWishlist, getWishlistCountForProduct } = require("../controllers/wishlistController");

// --- WISHLIST DATA ---
router.get("/:id",    getWishlist);    // View saved items
router.post("/:id",   toggleWishlist); // Add or remove toggle
router.get("/stats/:productId", getWishlistCountForProduct); // Get count across all sessions
router.delete("/:id", clearWishlist);  // Empty wishlist

module.exports = router;
