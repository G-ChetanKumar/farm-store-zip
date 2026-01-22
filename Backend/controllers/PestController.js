
const Pest = require("../models/PestModel");
const { uploadFileToS3, deleteFileFromS3 } = require("../service/aws-s3-service");

// Create a new pest
exports.createPest = async (req, res) => {
  try {
    const { name, sub_title, description, affectedCrops } = req.body;
    const file = req.file;

    if (!file || !name || !sub_title || !description || !affectedCrops) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const pest = new Pest({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      name,
      sub_title,
      description,
      affectedCrops: Array.isArray(affectedCrops) ? affectedCrops : [affectedCrops],
    });

    await pest.save();
    res.status(201).json({ message: "Pest created successfully!", pest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all pests
exports.getAllPests = async (req, res) => {
  try {
    const pests = await Pest.find().populate("affectedCrops");
    res.json(pests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pests" });
  }
};

// Get pests by crop
exports.getPestsByCrop = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const pests = await Pest.find({ affectedCrops: cropId });
    res.json(pests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pests for crop" });
  }
};

// Get pest by ID
exports.getPestById = async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id).populate("affectedCrops");
    if (!pest) return res.status(404).json({ error: "Pest not found" });
    res.json(pest);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pest" });
  }
};

// Update pest
exports.updatePest = async (req, res) => {
  try {
    const { name, sub_title, description, affectedCrops } = req.body;
    const file = req.file;
    let updateData = { name, sub_title, description };
    if (affectedCrops) {
      updateData.affectedCrops = Array.isArray(affectedCrops) ? affectedCrops : [affectedCrops];
    }
    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.fileName = file.originalname;
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }
    const pest = await Pest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pest) return res.status(404).json({ error: "Pest not found" });
    res.json(pest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete pest
exports.deletePest = async (req, res) => {
  try {
    const pest = await Pest.findByIdAndDelete(req.params.id);
    if (!pest) return res.status(404).json({ error: "Pest not found" });
    res.json({ message: "Pest deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete pest" });
  }
};
