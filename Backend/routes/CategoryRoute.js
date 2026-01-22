const express = require("express");
const categoryController = require("../controllers/CategoryController");
const router = express.Router();
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/add-category",
  adminAuth,
  upload.single("file"),
  categoryController.createCategory
);
router.get("/get-category", categoryController.getCategories);
router.get("/get-by-id-category/:id", categoryController.getCategoryById);
router.put(
  "/update-category/:id",
  adminAuth,
  upload.single("file"),
  categoryController.updateCategory
);
router.delete("/delete-category/:id", adminAuth, categoryController.deleteCategory);

module.exports = router;
