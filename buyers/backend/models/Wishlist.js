// =====================================================
// models/Wishlist.js
// Server-side wishlist keyed by sessionId.
// =====================================================

const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        addedAt:   { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);