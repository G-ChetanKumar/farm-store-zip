const Crop = require("../models/CropModel");
const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");

exports.createCrop = async (req, res) => {
  try {
    const { title, products } = req.body;
    const file = req.file;

    if (!file || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const crop = new Crop({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      title,
      products, // array of product IDs
    });

    await crop.save();
    res.status(201).json({ message: "Crop created successfully!", crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: "Error fetching crops" });
  }
};

exports.getByIdCrops = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    res.status(200).json(crop);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Brand" });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    const { title, products } = req.body;
    const file = req.file;
    const updateData = { title, products };

    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }

    const crop = await Crop.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    res.status(200).json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    if (crop.imagePublicId) {
      await deleteFileFromS3(crop.imagePublicId);
    }

    await Crop.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
