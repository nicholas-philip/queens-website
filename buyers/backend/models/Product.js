// =====================================================
// models/Product.js
// Shared Model between Store and Admin.
// =====================================================

const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  SKU:            { type: String, uppercase: true, trim: true }, 
  attributes:    { type: Map, of: String, default: {} },
  stockQuantity:   { type: Number, default: 0, min: 0 },
  priceAdjustment: { type: Number, default: 0 }, 
  image:           { type: String, default: null },
  isActive:        { type: Boolean, default: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    title:         { type: String, required: [true, "Title is required"], trim: true },
    brand:         { type: String, default: "" }, 
    description:   { type: String, required: [true, "Description is required"] },
    SKU:           { type: String, unique: true, uppercase: true, trim: true }, 
    slug:          { type: String, unique: true }, 
    price:         { type: Number, required: [true, "Price is required"], min: 0 },
    discountPrice: { type: Number, default: null },

    hasVariants:   { type: Boolean, default: false },
    variants:      { type: [VariantSchema], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 }, 

    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags:      { type: [String], default: [] },
    images:    { type: [String], default: [] },
    sizes:     { type: [String], default: [] },
    colors:    { type: [String], default: [] },

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

ProductSchema.pre("save", async function () {
  if (!this.SKU) {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase(); 
    const prefix = this.title.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    this.SKU = `QNS-${prefix}-${random}`;
  }
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
});

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);
