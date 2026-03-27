// =====================================================
// models/Collection.js
// Curated product collections / lookbooks.
// =====================================================

const mongoose = require("mongoose");
const slugify  = require("slugify");

const CollectionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, unique: true },
    description: { type: String, default: "" },
    subtitle:    { type: String, default: "" }, 
    coverImage:  { type: String, default: null },
    bannerImages:{ type: [String], default: [] },
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      sortOrder: { type: Number, default: 0 },
    }],
    tags:     { type: [String], default: [] },
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }, 
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

CollectionSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);