const Brand = require("../models/BrandModel");
const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");

exports.createBrand = async (req, res) => {
  try {
    const { title, products } = req.body;
    const file = req.file;

    if (!file || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const brand = new Brand({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      title,
      products, // array of product IDs
    });

    await brand.save();
    res.status(201).json({ message: "Brand created successfully!", brand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands" });
  }
};

exports.getByIdBrands = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Brand" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { title, products } = req.body;
    const file = req.file;
    const updateData = { title, products };

    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (brand.imagePublicId) {
      await deleteFileFromS3(brand.imagePublicId);
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
