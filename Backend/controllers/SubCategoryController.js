const SubCategory = require("../models/SubCategory");
const {
  uploadFileToS3,
  deleteFileFromS3,
} = require("../service/aws-s3-service");

exports.createSubCategory = async (req, res) => {
  try {
    const { title, category_id, super_cat_id } = req.body;
    const file = req.file;

    if (!file || !title || !super_cat_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const s3Response = await uploadFileToS3(file);

    const subcategory = new SubCategory({
      fileName: file.originalname,
      imageUrl: s3Response.url,
      imagePublicId: s3Response.key,
      super_cat_id: super_cat_id,
      title,
      category_id,
    });

    await subcategory.save();
    res
      .status(201)
      .json({ message: "Sub Category created successfully!", subcategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find();
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub categories" });
  }
};

exports.getByIdSubCategories = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id);
    if (!subcategory)
      return res.status(404).json({ message: "Sub Category not found" });

    res.status(200).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub category" });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { title, category_id, super_cat_id } = req.body;
    const file = req.file;
    const updateData = { title, category_id, super_cat_id };

    if (file) {
      const s3Response = await uploadFileToS3(file);
      updateData.imageUrl = s3Response.url;
      updateData.imagePublicId = s3Response.key;
    }

    const subcategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!subcategory)
      return res.status(404).json({ message: "Sub Category not found" });

    res.status(200).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id);
    if (!subcategory)
      return res.status(404).json({ message: "Sub Category not found" });

    if (subcategory.imagePublicId) {
      await deleteFileFromS3(subcategory.imagePublicId);
    }

    await SubCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Sub Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
