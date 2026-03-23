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
const catchAsync = require("../utils/catchAsync");
const filterQuery = require("../utils/filterQuery");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/Cloudinaryupload");
const logActivity = require("../middleware/activityLogger");

// ── GET /admin/products/low-stock ─────────────────
// Returns products where stock is at or below the low-stock threshold (default 10)
const getLowStockProducts = catchAsync(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;
  const products = await Product.find({ stock: { $lte: threshold } })
    .sort({ stock: 1 })
    .select("name sku stock status images price category")
    .populate("category", "name");

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
  const result = await filterQuery(Product, req.query, ["status", "category"]);
  res.status(200).json({ success: true, ...result });
});

// ── POST /admin/products ──────────────────────────
// Create a new product; handles image uploads via multer + Cloudinary
const createProduct = catchAsync(async (req, res) => {
  // Upload any images sent via multer (req.files from upload.array("images", 5))
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );
  }

  const product = await Product.create({ ...req.body, images });
  await logActivity(req, "CREATED_PRODUCT", `Product: ${product.name}`);

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product,
  });
});

// ── GET /admin/products/:id ───────────────────────
const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  res.status(200).json({ success: true, product });
});

// ── PUT /admin/products/:id ───────────────────────
// Full update — replaces all editable fields
const updateProduct = catchAsync(async (req, res) => {
  // Upload new images if any were sent
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );
    // Append to existing images instead of replacing (frontend can delete individually)
    req.body.images = newImages;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  await logActivity(req, "UPDATED_PRODUCT", `Product: ${product.name}`);
  res.status(200).json({ success: true, message: "Product updated.", product });
});

// ── PATCH /admin/products/:id/status ─────────────
// Toggle active/inactive/draft without touching other fields
const updateProductStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const allowed = ["active", "inactive", "draft"];
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

  await logActivity(req, "UPDATED_PRODUCT_STATUS", `Product: ${product.name}`, `Status → ${status}`);
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

  const newStock = (product.stock || 0) + adjustment;
  if (newStock < 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot reduce stock below 0. Current stock: ${product.stock}.`,
    });
  }

  product.stock = newStock;
  await product.save();

  await logActivity(
    req, "ADJUSTED_STOCK",
    `Product: ${product.name}`,
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

  await logActivity(req, "DELETED_PRODUCT", `Product: ${product.name}`);
  res.status(200).json({ success: true, message: `Product "${product.name}" deleted.` });
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
  await logActivity(req, "ADDED_VARIANT", `Product: ${product.name}`, `Variant: ${req.body.name || req.body.sku || "new"}`);

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

  await logActivity(req, "DELETED_VARIANT", `Product: ${product.name}`);
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