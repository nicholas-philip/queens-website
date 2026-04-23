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
  SKU:            { type: String, uppercase: true, trim: true }, // Not globally unique for variants, but unique within product is usually better. 
  attributes:    { type: Map, of: String, default: {} }, // Flexible: { "size": "10" } or { "volume": "50ml", "scent": "Floral" }
  stockQuantity:   { type: Number, default: 0, min: 0 },
  priceAdjustment: { type: Number, default: 0 }, // +/- from base price
  image:           { type: String, default: null },
  isActive:        { type: Boolean, default: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    title:         { type: String, required: [true, "Title is required"], trim: true },
    brand:         { type: String, default: "" }, // Brand or Manufacturer
    description:   { type: String, required: [true, "Description is required"] },
    SKU:           { type: String, unique: true, sparse: true, uppercase: true, trim: true }, // Sparse allows multiple nulls if needed, though we avoid it
    slug:          { type: String, unique: true, sparse: true }, // For SEO friendly URLs
    price:         { type: Number, required: [true, "Price is required"], min: 0 },
    priceSuffix:   { type: String, default: "" }, // e.g. "each", "per set", "pair"
    discountPrice: { type: Number, default: null },

    hasVariants:   { type: Boolean, default: false },
    variants:      { type: [VariantSchema], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 }, // used when hasVariants=false

    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String, default: "" },
    tags:      { type: [String], default: [] },
    sizes:     { type: [String], default: [] },
    colors:    { type: [String], default: [] },
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

// Auto-generate SKU and Slug
ProductSchema.pre("save", async function () {
  // Generate SKU if missing
  if (!this.SKU) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    const prefix = this.title.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    this.SKU = `${prefix}-${Date.now().toString().slice(-4)}-${random}`;
  }

  // Generate Slug from title
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Ensure variants also have SKUs if they exist
  if (this.hasVariants && this.variants.length > 0) {
    this.variants.forEach((v, index) => {
      if (!v.SKU) {
        v.SKU = `${this.SKU}-V${index + 1}`;
      }
    });
  }
});

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