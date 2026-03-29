// =====================================================
// routes/wishlistRoutes.js
// Guest favorite management.
// =====================================================

const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist, clearWishlist } = require("../controllers/wishlistController");

// --- WISHLIST DATA ---
router.get("/:id",    getWishlist);    // View saved items
router.post("/:id",   toggleWishlist); // Add or remove toggle
router.delete("/:id", clearWishlist);  // Empty wishlist

module.exports = router;
