const Category = require("../models/CategoryModel");
const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");
exports.createCategory = async (req, res) => {
  try {
    const { super_cat_id, title } = req.body;
    const file = req.file;

    if (!file || !title || !super_cat_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const category = new Category({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      super_cat_id: super_cat_id,
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
    const { title, super_cat_id } = req.body;
    const file = req.file;
    const updateData = { title, super_cat_id };

    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });

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
