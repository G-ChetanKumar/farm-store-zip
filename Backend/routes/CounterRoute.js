const express = require("express");
const router = express.Router();
const counterContoller = require("../controllers/CounterController");
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");
const upload = multer();

router.post("/add-counter", adminAuth, upload.none(), counterContoller.createCrop);
router.get("/get-counters", counterContoller.getAllCrops);
router.get("/get-id-counter/:id", counterContoller.getByIdCrops);
router.put("/update-counter/:id", adminAuth, upload.none(), counterContoller.updateCrop);
router.delete("/delete-counter/:id", adminAuth, counterContoller.deleteCrop);

module.exports = router;
