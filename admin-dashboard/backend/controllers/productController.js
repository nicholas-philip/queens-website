// =====================================================
// controllers/productController.js
//
// Full product management for the admin dashboard.
//
// Routes (all protected by verifyAdmin):
//   GET    /admin/products/low-stock         → getLowStockProducts
//   GET    /admin/products                   → getProducts
//   POST   /admin/products                   → createProduct
//   GET    /admin/products/:id               → getProductById
//   PUT    /admin/products/:id               → updateProduct
//   PATCH  /admin/products/:id/status        → updateProductStatus
//   PATCH  /admin/products/:id/stock         → adjustStock
//   DELETE /admin/products/:id               → deleteProduct
//   POST   /admin/products/:id/variants      → addVariant
//   PUT    /admin/products/:id/variants/:vid → updateVariant
//   DELETE /admin/products/:id/variants/:vid → deleteVariant
// =====================================================

const Product    = require("../models/Product");
const Wishlist   = require("../models/Wishlist");
const catchAsync = require("../utils/catchAsync");
const filterQuery = require("../utils/filterQuery");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/Cloudinaryupload");
const logActivity = require("../middleware/activityLogger");
const { sendPushNotification } = require("../utils/firebase");

// ── GET /admin/products/low-stock ─────────────────
// Returns products where stock is at or below the low-stock threshold (default 10)
// Improved to handle variants correctly via aggregation.
const getLowStockProducts = catchAsync(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  // We use aggregation to check both product-level stock and individual variant stock
  const products = await Product.aggregate([
    {
      $match: {
        $or: [
          { hasVariants: false, stockQuantity: { $lte: threshold } },
          { hasVariants: true, "variants.stockQuantity": { $lte: threshold } }
        ]
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDoc"
      }
    },
    { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        SKU: 1,
        brand: 1,
        stockQuantity: 1,
        status: 1,
        images: 1,
        price: 1,
        hasVariants: 1,
        variants: 1,
        category: "$categoryDoc.name"
      }
    },
    { $sort: { stockQuantity: 1 } }
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    threshold,
    products,
  });
});

// ── GET /admin/products ───────────────────────────
// All products with filtering, search, and pagination via filterQuery
const getProducts = catchAsync(async (req, res) => {
  const result = await filterQuery(Product, req.query, ["status", "category", "brand"]);
  res.status(200).json({ success: true, ...result });
});

const createProduct = catchAsync(async (req, res) => {
  // Upload any images sent via multer (req.files from upload.array("images", 5))
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );
  }

  if (typeof req.body.tags === "string") {
    req.body.tags = req.body.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof req.body.sizes === "string") {
    req.body.sizes = req.body.sizes.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof req.body.colors === "string") {
    req.body.colors = req.body.colors.split(",").map((t) => t.trim()).filter(Boolean);
  }

  const product = await Product.create({ ...req.body, images });
  await logActivity(req, "CREATED_PRODUCT", `Product: ${product.title}`);

  // 🔔 Send Real-time Push Notification to all subscribed devices
  try {
    const notificationTitle = "Queens Fashion Store - New Arrival! ✨";
    const notificationBody = `Just added: ${product.title}. Shop the latest elegance today!`;
    const notificationData = {
        type: "NEW_PRODUCT",
        productId: product._id.toString(),
        imageUrl: images[0] || "",
    };
    
    // We don't await this as we don't want to block the response to the admin
    sendPushNotification(notificationTitle, notificationBody, notificationData);
  } catch (err) {
    console.error("FCM Broadcast failed:", err.message);
  }

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product,
  });
});

// ── GET /admin/products/:id ───────────────────────
const mongoose = require("mongoose");

const getProductById = catchAsync(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID format." });
  }
  const product = await Product.findById(req.params.id).populate("category", "name");
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // Fetch wishlist metrics
  const wishlistCount = await Wishlist.countDocuments({ "items.productId": req.params.id });

  res.status(200).json({ 
    success: true, 
    product: {
      ...product.toObject(),
      wishlistCount
    }
  });
});

// ── PUT /admin/products/:id ───────────────────────
// Full update — replaces all editable fields
const updateProduct = catchAsync(async (req, res) => {
  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  if (typeof req.body.tags === "string") {
    req.body.tags = req.body.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof req.body.sizes === "string") {
    req.body.sizes = req.body.sizes.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof req.body.colors === "string") {
    req.body.colors = req.body.colors.split(",").map((t) => t.trim()).filter(Boolean);
  }

  let keptImages = [];
  if (req.body.existingImages) {
    keptImages = Array.isArray(req.body.existingImages) 
      ? req.body.existingImages 
      : [req.body.existingImages];
  }

  const imagesToDelete = (existingProduct.images || []).filter(img => !keptImages.includes(img));
  if (imagesToDelete.length > 0) {
    await Promise.allSettled(imagesToDelete.map(url => deleteFromCloudinary(url)));
  }

  let newImages = [];
  if (req.files && req.files.length > 0) {
    newImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );
  }

  req.body.images = [...keptImages, ...newImages];

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logActivity(req, "UPDATED_PRODUCT", `Product: ${product.title}`);
  res.status(200).json({ success: true, message: "Product updated.", product });
});

// ── PATCH /admin/products/:id/status ─────────────
// Toggle active/inactive/draft without touching other fields
const updateProductStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Active", "Draft", "Out of Stock"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${allowed.join(", ")}.`,
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  await logActivity(req, "UPDATED_PRODUCT_STATUS", `Product: ${product.title}`, `Status → ${status}`);
  res.status(200).json({ success: true, message: `Product status set to "${status}".`, product });
});

// ── PATCH /admin/products/:id/stock ──────────────
// Adjust stock by a delta (positive = add, negative = subtract)
const adjustStock = catchAsync(async (req, res) => {
  const { adjustment, reason } = req.body;
  if (typeof adjustment !== "number") {
    return res.status(400).json({ success: false, message: "adjustment must be a number." });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const newStock = (product.stockQuantity || 0) + adjustment;
  if (newStock < 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot reduce stock below 0. Current stock: ${product.stockQuantity}.`,
    });
  }

  product.stockQuantity = newStock;
  await product.save();

  await logActivity(
    req, "ADJUSTED_STOCK",
    `Product: ${product.title}`,
    `${adjustment > 0 ? "+" : ""}${adjustment} → New stock: ${newStock}. Reason: ${reason || "N/A"}`
  );

  res.status(200).json({
    success: true,
    message: `Stock adjusted by ${adjustment}. New stock: ${newStock}.`,
    stock: newStock,
    product,
  });
});

// ── DELETE /admin/products/:id ────────────────────
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // Clean up Cloudinary images
  if (product.images && product.images.length > 0) {
    await Promise.allSettled(product.images.map((url) => deleteFromCloudinary(url)));
  }

  await logActivity(req, "DELETED_PRODUCT", `Product: ${product.title}`);
  res.status(200).json({ success: true, message: `Product "${product.title}" deleted.` });
});

// ── POST /admin/products/:id/variants ────────────
const addVariant = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  product.variants = product.variants || [];
  product.variants.push(req.body);
  await product.save();

  const newVariant = product.variants[product.variants.length - 1];
  await logActivity(req, "ADDED_VARIANT", `Product: ${product.title}`, `Variant: ${req.body.SKU || "new"}`);

  res.status(201).json({
    success: true,
    message: "Variant added.",
    variant: newVariant,
    variants: product.variants,
  });
});

// ── PUT /admin/products/:id/variants/:variantId ──
const updateVariant = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const variant = product.variants && product.variants.id(req.params.variantId);
  if (!variant) {
    return res.status(404).json({ success: false, message: "Variant not found." });
  }

  Object.assign(variant, req.body);
  await product.save();

  res.status(200).json({ success: true, message: "Variant updated.", variant });
});

// ── DELETE /admin/products/:id/variants/:variantId
const deleteVariant = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const variant = product.variants && product.variants.id(req.params.variantId);
  if (!variant) {
    return res.status(404).json({ success: false, message: "Variant not found." });
  }

  variant.deleteOne();
  await product.save();

  await logActivity(req, "DELETED_VARIANT", `Product: ${product.title}`);
  res.status(200).json({ success: true, message: "Variant deleted.", variants: product.variants });
});

module.exports = {
  getLowStockProducts,
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateProductStatus,
  adjustStock,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};