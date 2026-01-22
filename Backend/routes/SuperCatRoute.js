const express = require("express");
const categoryController = require("../controllers/SuperCatContoller");
const router = express.Router();
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/add-super-category",
  adminAuth,
  upload.single("file"),
  categoryController.createCategory
);
router.get("/get-super-category", categoryController.getCategories);
router.get("/get-by-id-super-category/:id", categoryController.getCategoryById);
router.put(
  "/update-super-category/:id",
  adminAuth,
  upload.single("file"),
  categoryController.updateCategory
);
router.delete("/delete-super-category/:id", adminAuth, categoryController.deleteCategory);

module.exports = router;
