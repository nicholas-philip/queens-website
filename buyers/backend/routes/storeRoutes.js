// =====================================================
// routes/storeRoutes.js
// Home and global store info.
// =====================================================

const express = require("express");
const router = express.Router();
const { getStoreInfo, getHomepage } = require("../controllers/storeController");

// --- PUBLIC DATA ---
router.get("/info",     getStoreInfo);    // Brand identity & settings
router.get("/homepage", getHomepage);     // All home sections in 1 request

module.exports = router;
