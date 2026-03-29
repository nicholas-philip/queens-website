// =====================================================
// controllers/wishlistController.js
// Guest favorite management.
// =====================================================

const Wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  try {
    const { id } = req.params; // Session-based ID
    const wishlist = await Wishlist.findOne({ sessionId: id })
      .populate({ 
        path: "items.productId", 
        select: "title price images status discountPrice SKU reviewCount averageRating" 
      });

    const activeItems = (wishlist?.items || [])
      .filter(i => i.productId?.status === "Active")
      .map(i => ({
        ...i.productId.toObject(),
        addedAt: i.addedAt,
      }));

    res.status(200).json({ success: true, items: activeItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Missing product ID." });

    let wishlist = await Wishlist.findOne({ sessionId: id });
    if (!wishlist) {
      wishlist = new Wishlist({ sessionId: id, items: [] });
    }

    const idx = wishlist.items.findIndex(i => i.productId.toString() === productId);
    if (idx > -1) {
      // Remove
      wishlist.items.splice(idx, 1);
    } else {
      // Add
      wishlist.items.push({ productId });
    }

    await wishlist.save();
    res.status(200).json({ success: true, count: wishlist.items.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    await Wishlist.findOneAndDelete({ sessionId: id });
    res.status(200).json({ success: true, message: "Wishlist cleared." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist, clearWishlist };
