const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/add-product",
  adminAuth,
  upload.array("images", 3),
  productController.createProduct
);
router.get("/get-product", productController.getAllProduct);
router.get("/get-id-product/:id", productController.getByIdProduct);
router.put(
  "/update-product/:id",
  adminAuth,
  upload.array("images", 3),
  productController.updateProduct
);
router.delete("/delete-product/:id", adminAuth, productController.deleteProduct);

module.exports = router;
