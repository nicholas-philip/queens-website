// =====================================================
// controllers/storeController.js
// Powers the homepage components: banners, best sellers, etc.
// =====================================================

const Product  = require("../models/Product");
const Category = require("../models/Category");
const Settings = require("../models/Settings");
const Review   = require("../models/Review");

const getStoreInfo = async (req, res) => {
  try {
    const s = await Settings.getSettings();
    res.status(200).json({
      success: true,
      store: {
        name:               s.storeName,
        email:              s.storeEmail,
        logoUrl:            s.logoUrl,
        currencySymbol:     s.currencySymbol,
        maintenanceMode:    s.maintenanceMode,
        freeShippingThreshold: s.freeShippingThreshold,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getHomepage = async (req, res) => {
  try {
    const [featured, newArrivals, bestSellers, categories, reviews] = await Promise.all([
      Product.find({ status: "Active", tags: "featured" }).limit(8).populate("category", "name slug"),
      Product.find({ status: "Active" }).sort({ createdAt: -1 }).limit(8).populate("category", "name slug"),
      Product.find({ status: "Active" }).sort({ totalSold: -1 }).limit(8).populate("category", "name slug"),
      Category.find({ isActive: true }).limit(8),
      Review.find({ isApproved: true, rating: { $gte: 4 } }).sort({ createdAt: -1 }).limit(6).populate("productId", "title images"),
    ]);

    res.status(200).json({
      success: true,
      homepage: { featured, newArrivals, bestSellers, categories, reviews },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStoreInfo, getHomepage };