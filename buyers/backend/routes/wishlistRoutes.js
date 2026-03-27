// =====================================================
// routes/wishlistRoutes.js
// Guest favorite management.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  wishlistController: { getWishlist, toggleWishlist, clearWishlist } 
} = require("../controllers/reviewController");

// --- WISHLIST DATA ---
router.get("/:id",    getWishlist);    // View saved items
router.post("/:id",   toggleWishlist); // Add or remove toggle
router.delete("/:id", clearWishlist);  // Empty wishlist

module.exports = router;
