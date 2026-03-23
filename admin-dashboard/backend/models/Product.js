// =====================================================
// models/Product.js
// Full product with optional variant support.
//
// Simple:  hasVariants=false → uses stockQuantity
// Variant: hasVariants=true  → each variant has its own stock
// Virtuals: effectivePrice, totalStock
// =====================================================

const mongoose = require("mongoose");

// One size/color variant
const VariantSchema = new mongoose.Schema({
  SKU:            { type: String, required: true, uppercase: true, trim: true },
  attributes: {
    size:     { type: String, default: null },
    color:    { type: String, default: null },
    material: { type: String, default: null },
  },
  stockQuantity:   { type: Number, default: 0, min: 0 },
  priceAdjustment: { type: Number, default: 0 }, // +/- from base price
  image:           { type: String, default: null },
  isActive:        { type: Boolean, default: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    title:         { type: String, required: [true, "Title is required"], trim: true },
    description:   { type: String, required: [true, "Description is required"] },
    SKU:           { type: String, required: [true, "SKU is required"], unique: true, uppercase: true, trim: true },
    price:         { type: Number, required: [true, "Price is required"], min: 0 },
    discountPrice: { type: Number, default: null },

    hasVariants:   { type: Boolean, default: false },
    variants:      { type: [VariantSchema], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 }, // used when hasVariants=false

    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags:      { type: [String], default: [] },
    images:    { type: [String], default: [] },

    status: {
      type:    String,
      enum:    ["Active", "Draft", "Out of Stock"],
      default: "Draft",
    },

    totalSold:     { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },

    metadata: {
      metaTitle:       { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords:    { type: [String], default: [] },
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Effective selling price (discount overrides regular)
ProductSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice !== null ? this.discountPrice : this.price;
});

// Total units available across all variants
ProductSchema.virtual("totalStock").get(function () {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((s, v) => s + (v.isActive ? v.stockQuantity : 0), 0);
  }
  return this.stockQuantity;
});

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);