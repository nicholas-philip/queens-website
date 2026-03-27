// =====================================================
// models/Blog.js
// Beauty blog — tutorials, tips, product spotlights.
// =====================================================

const mongoose = require("mongoose");
const slugify  = require("slugify");

const BlogSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    slug:     { type: String, unique: true },
    excerpt:  { type: String, required: true }, 
    content:  { type: String, required: true }, 

    coverImage:  { type: String, default: null },
    images:      { type: [String], default: [] },

    category: { type: String, default: "Tip" },
    tags:   { type: [String], default: [] },
    featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    author: {
      name:   { type: String, default: "GlossyKiss Team" },
      avatar: { type: String, default: null },
    },
    isPublished:  { type: Boolean, default: false },
    publishedAt:  { type: Date,    default: null },
    readTimeMin:  { type: Number,  default: 3 },  
    viewCount:    { type: Number,  default: 0 },
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

BlogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);