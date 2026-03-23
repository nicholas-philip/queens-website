// =====================================================
// models/Category.js
// Product groups (e.g. Lipgloss, Bundles).
// =====================================================

const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true }, // URL friendly version of name
  description: { type: String },
  image: { type: String }, // Cloudinary URL
}, { timestamps: true });

// Auto-create a slug (e.g. "Lip Balm" -> "lip-balm")
CategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().split(' ').join('-');
  }
  next();
});

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);