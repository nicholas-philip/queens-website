// =====================================================
// utils/cloudinaryUpload.js
// Handles uploading and deleting images on Cloudinary.
// Uses memory storage — no temp files on disk.
// =====================================================

const cloudinary = require("cloudinary").v2;
const multer     = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store file in RAM as a Buffer (no disk writes)
const storage    = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed."), false);
};

// Multer instance — max 5 images, 5 MB each
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload a single image buffer → returns the Cloudinary CDN URL
const uploadToCloudinary = (buffer, folder = "products") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// Delete an image using its Cloudinary URL
const deleteFromCloudinary = async (url) => {
  try {
    const parts    = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder   = parts[parts.length - 2];
    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  } catch (err) {
    console.error("⚠️ Cloudinary delete failed:", err.message);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };