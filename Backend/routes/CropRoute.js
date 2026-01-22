const express = require("express");
const router = express.Router();
const cropContoller = require("../controllers/CropController");
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/add-crop", adminAuth, upload.single("file"), cropContoller.createCrop);
router.get("/get-crops", cropContoller.getAllCrops);
router.get("/get-id-crop/:id", cropContoller.getByIdCrops);
router.put("/update-crop/:id", adminAuth, upload.single("file"), cropContoller.updateCrop);
router.delete("/delete-crop/:id", adminAuth, cropContoller.deleteCrop);

module.exports = router;
