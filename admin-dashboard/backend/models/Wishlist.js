// =====================================================
// models/Wishlist.js
// Mirror of the buyer backend wishlist model.
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
