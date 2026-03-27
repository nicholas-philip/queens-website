// seed.js — Run once to create a test product for Postman testing
// Usage: node seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product  = require("./models/Product");

(async () => {
  await connectDB();

  // 1. Create or reuse a test category
  let category = await Category.findOne({ slug: "skincare" });
  if (!category) {
    category = await Category.create({
      name: "Skincare",
      description: "Face and body skincare products",
    });
    console.log("✅ Category created:", category.name);
  } else {
    console.log("ℹ️  Category already exists:", category.name);
  }

  // 2. Create or reuse a test product
  let product = await Product.findOne({ slug: "queens-glow-serum" });
  if (!product) {
    product = await Product.create({
      title:         "Queens Glow Serum",
      brand:         "Queens Beauty",
      description:   "A luxurious brightening serum with Vitamin C and hyaluronic acid.",
      price:         12500,
      discountPrice: 9999,
      stockQuantity: 100,
      category:      category._id,
      status:        "Active",
      tags:          ["serum", "vitamin-c", "glow", "skincare"],
    });
    console.log("✅ Product created:", product.title);
  } else {
    console.log("ℹ️  Product already exists:", product.title);
  }

  console.log("\n===========================================");
  console.log("🛍️  PRODUCT ID TO USE IN POSTMAN:");
  console.log("   ", product._id.toString());
  console.log("===========================================\n");
  console.log("Paste this into your 'Submit Order Checkout' body as:");
  console.log(`   "productId": "${product._id.toString()}"`);
  console.log("\nOR — just run 'All Products' in Postman first and the");
  console.log("{{productId}} variable will be set automatically.\n");

  await mongoose.disconnect();
  process.exit(0);
})();
