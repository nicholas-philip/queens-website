// =====================================================
// models/Category.js
// Product groups (e.g. Lipgloss, Bundles).
// Shared with Admin Dashboard.
// =====================================================

const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true }, // URL friendly version of name
  description: { type: String },
  image: { type: String }, // Cloudinary URL
  isActive: { type: Boolean, default: true },
  productCount: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-create a slug (e.g. "Lip Balm" -> "lip-balm")
CategorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);
