// =====================================================
// controllers/categoryController.js
// Product category management.
//
// GET    /categories              — public list
// GET    /categories/:id         — public single (with products)
// GET    /admin/categories        — admin list
// POST   /admin/categories        — create
// PUT    /admin/categories/:id    — update
// DELETE /admin/categories/:id    — delete
//
// NOTE: Coupon logic → couponController.js
//       Review logic → reviewController.js
// =====================================================

const Category    = require("../models/Category");
const Product     = require("../models/Product");
const logActivity = require("../middleware/activityLogger");
const { uploadToCloudinary } = require("../utils/Cloudinaryupload");


const getAllCategories = async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "assignedProducts"
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        isActive: 1,
        slug: 1,
        productCount: { $size: "$assignedProducts" }
      }
    },
    { $sort: { name: 1 } }
  ]);
  res.status(200).json({ success: true, count: categories.length, categories });
};

const getCategoryById = async (req, res) => {
  const cat = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  const products = await Product.find({ category: cat._id, status: "Active" }).limit(12).select("title price discountPrice images SKU totalSold");
  res.status(200).json({ success: true, category: cat, products });
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Category name is required." });
  const exists = await Category.findOne({ name: name.trim() });
  if (exists) return res.status(400).json({ success: false, message: `Category "${name}" already exists.` });

  let image = null;
  if (req.file) image = await uploadToCloudinary(req.file.buffer, "categories");

  const cat = await Category.create({ name, description, image });
  await logActivity(req, "CREATED_CATEGORY", `Category: ${cat.name}`);
  res.status(201).json({ success: true, message: `Category "${cat.name}" created.`, category: cat });
};

const updateCategory = async (req, res) => {
  const updates = {};
  ["name","description","isActive"].forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (req.file) updates.image = await uploadToCloudinary(req.file.buffer, "categories");

  const cat = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  await logActivity(req, "UPDATED_CATEGORY", `Category: ${cat.name}`);
  res.status(200).json({ success: true, message: "Category updated.", category: cat });
};

const deleteCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
  const count = await Product.countDocuments({ category: cat._id });
  if (count > 0) return res.status(400).json({ success: false, message: `Cannot delete — ${count} product(s) still use this category.` });
  await cat.deleteOne();
  await logActivity(req, "DELETED_CATEGORY", `Category: ${cat.name}`);
  res.status(200).json({ success: true, message: `Category "${cat.name}" deleted.` });
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };