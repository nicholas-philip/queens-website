// =====================================================
// controllers/blogController.js
// Admin Blog Management Controller
// =====================================================

const Blog = require("../models/Blog");

exports.getAllPosts = async (req, res) => {
  const { isPublished, category, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (isPublished !== undefined) {
    filter.isPublished = isPublished === "true";
  }
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    posts,
  });
};

exports.getPostById = async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  res.status(200).json({ success: true, post });
};

exports.createPost = async (req, res) => {
  const { title, excerpt, content, category, authorName, authorAvatar, tags, readTimeMin } = req.body;

  if (!title || !excerpt || !content) {
    res.status(400);
    throw new Error("Title, excerpt, and content are required");
  }

  // Handle uploaded cover image
  try {
      console.log("Creating newPost object...");
      const newPost = new Blog({
        title,
        excerpt,
        content,
        category,
        author: {
          name: authorName || "Queens Fashion Store Team",
          avatar: authorAvatar || null,
        },
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
        readTimeMin: readTimeMin || 3,
        slug: req.body.slug,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription
      });

      if (req.file) {
          console.log("Uploading image to Cloudinary...");
          const { uploadToCloudinary } = require("../utils/Cloudinaryupload");
          newPost.coverImage = await uploadToCloudinary(req.file.buffer, "blog");
      }

      console.log("Saving newPost...");
      const savedPost = await newPost.save();
      console.log("newPost saved!");

      res.status(201).json({
        success: true,
        message: "Blog post created successfully",
        post: savedPost,
      });
  } catch (err) {
      console.error("Error inside createPost:", err);
      throw err;
  }
};

exports.updatePost = async (req, res) => {
  const { title, excerpt, content, category, authorName, authorAvatar, tags, readTimeMin } = req.body;
  const post = await Blog.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  if (title) post.title = title;
  if (excerpt) post.excerpt = excerpt;
  if (content) post.content = content;
  if (category) post.category = category;
  if (authorName) post.author.name = authorName;
  if (authorAvatar) post.author.avatar = authorAvatar;
  if (readTimeMin) post.readTimeMin = readTimeMin;
  if (req.body.slug !== undefined) post.slug = req.body.slug;
  if (req.body.metaTitle !== undefined) post.metaTitle = req.body.metaTitle;
  if (req.body.metaDescription !== undefined) post.metaDescription = req.body.metaDescription;

  if (tags) {
    post.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());
  }

  // Handle uploaded cover image
  if (req.file) {
    const { uploadToCloudinary } = require("../utils/Cloudinaryupload");
    post.coverImage = await uploadToCloudinary(req.file.buffer, "blog");
  }

  const updatedPost = await post.save();

  res.status(200).json({
    success: true,
    message: "Blog post updated successfully",
    post: updatedPost,
  });
};

exports.togglePublish = async (req, res) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  post.isPublished = !post.isPublished;
  if (post.isPublished && !post.publishedAt) {
    post.publishedAt = new Date();
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: post.isPublished ? "Post published" : "Post unpublished",
    post,
  });
};

exports.deletePost = async (req, res) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog post deleted successfully",
  });
};
