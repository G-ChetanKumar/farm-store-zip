const Category = require("../models/SuperCatModel");

const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");

exports.createCategory = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const category = new Category({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      title,
     
    });

    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully!", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    let { title, enabled } = req.body;
    const file = req.file;
    const updateData = {};

    if (title !== undefined) updateData.title = title;

    // Parse enabled correctly
    if (enabled !== undefined) {
      if (typeof enabled === "string") {
        updateData.enabled = enabled === "true" || enabled === "1";
      } else {
        updateData.enabled = Boolean(enabled);
      }
    }

    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.imagePublicId) {
      await deleteFileFromS3(category.imagePublicId);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
