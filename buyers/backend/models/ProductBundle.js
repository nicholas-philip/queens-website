// =====================================================
// models/ProductBundle.js
// Gift sets and product bundles.
// =====================================================

const mongoose = require("mongoose");
const slugify  = require("slugify");

const BundleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, unique: true },
    description: { type: String, required: true },
    coverImage:  { type: String, default: null },
    images:      { type: [String], default: [] },
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
      quantity:  { type: Number, default: 1 },
    }],
    bundlePrice:   { type: Number, required: true },
    originalPrice: { type: Number, required: true }, 
    tags:      { type: [String], default: [] },
    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    status: { type: String, enum: ["Active", "Draft", "Sold Out"], default: "Draft" },
    isFeatured:  { type: Boolean, default: false },
    isGiftSet:   { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

BundleSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.models.ProductBundle || mongoose.model("ProductBundle", BundleSchema);