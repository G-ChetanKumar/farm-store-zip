
const express = require("express");
const pestController = require("../controllers/PestController");
const router = express.Router();
const adminAuth = require("../middlewares/AdminAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create pest
router.post("/add-pest", adminAuth, upload.single("file"), pestController.createPest);
// Get all pests
router.get("/get-pests", pestController.getAllPests);
// Get pests by crop
router.get("/get-pests/:cropId", pestController.getPestsByCrop);
// Get pest by ID
router.get("/get-pest/:id", pestController.getPestById);
// Update pest
router.put("/update-pest/:id", adminAuth, upload.single("file"), pestController.updatePest);
// Delete pest
router.delete("/delete-pest/:id", adminAuth, pestController.deletePest);

module.exports = router;
