const express = require("express");
const router = express.Router();
const brandContoller = require("../controllers/BrandController");
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/add-brand", adminAuth, upload.single("file"), brandContoller.createBrand);
router.get("/get-brand", brandContoller.getAllBrands);
router.get("/get-id-brand/:id", brandContoller.getByIdBrands);
router.put(
  "/update-brand/:id",
  adminAuth,
  upload.single("file"),
  brandContoller.updateBrand
);
router.delete("/delete-brand/:id", adminAuth, brandContoller.deleteBrand);

module.exports = router;
