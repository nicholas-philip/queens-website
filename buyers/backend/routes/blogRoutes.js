// =====================================================
// routes/blogRoutes.js
// Beauty tutorials and tips.
// =====================================================

const express = require("express");
const router = express.Router();
const { 
  blogController: { getPosts, getPostBySlug, getBlogCategories } 
} = require("../controllers/blogController");

// --- BLOG ACCESS ---
router.get("/",           getPosts);      // List all published posts
router.get("/categories", getBlogCategories); // Filter list
router.get("/:slug",      getPostBySlug); // Single tutorial view

module.exports = router;
