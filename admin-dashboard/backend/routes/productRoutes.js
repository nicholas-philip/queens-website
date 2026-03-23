const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAdmin } = require("../middleware/verifyAdmin");

// Public (to see items on storefront)
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

// Admin Only (manage items)
router.post("/", verifyAdmin, productController.createProduct);
router.patch("/:id", verifyAdmin, productController.updateProduct);
router.delete("/:id", verifyAdmin, productController.deleteProduct);

module.exports = router;
