const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/SubCategoryController");
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/add-sub-category",
  adminAuth,
  upload.single("file"),
  subcategoryController.createSubCategory
);
router.get("/get-sub-category", subcategoryController.getAllSubCategories);
router.get(
  "/get-id-sub-category/:id",
  subcategoryController.getByIdSubCategories
);
router.put(
  "/update-sub-category/:id",
  adminAuth,
  upload.single("file"),
  subcategoryController.updateSubCategory
);
router.delete(
  "/delete-sub-category/:id",
  adminAuth,
  subcategoryController.deleteSubCategory
);

module.exports = router;
