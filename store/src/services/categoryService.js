import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Category Service for Customer Store
 * Handles all category, brand, and crop API calls
 */

export const categoryService = {
  /**
   * Get all super categories
   * @returns {Promise<Array>}
   */
  getAllSuperCategories: async () => {
    const response = await axios.get(`${BASE_URL}/super-category/get-super-category`);
    return response.data;
  },

  /**
   * Get E-Store super category ID
   * @returns {Promise<string|null>}
   */
  getEStoreId: async () => {
    const response = await axios.get(`${BASE_URL}/super-category/get-super-category`);
    const eStore = response.data.find(
      (cat) => cat.title?.toLowerCase() === "e-store" || cat.name?.toLowerCase() === "e-store"
    );
    return eStore?._id || null;
  },

  /**
   * Get E-Fresh super category ID
   * @returns {Promise<string|null>}
   */
  getEFreshId: async () => {
    const response = await axios.get(`${BASE_URL}/super-category/get-super-category`);
    const eFresh = response.data.find(
      (cat) => cat.title?.toLowerCase() === "e-fresh" || cat.name?.toLowerCase() === "e-fresh"
    );
    return eFresh?._id || null;
  },

  /**
   * Get E-Meds super category ID
   * @returns {Promise<string|null>}
   */
  getEMedsId: async () => {
    const response = await axios.get(`${BASE_URL}/super-category/get-super-category`);
    const eMeds = response.data.find(
      (cat) => cat.title?.toLowerCase() === "e-meds" || cat.name?.toLowerCase() === "e-meds"
    );
    return eMeds?._id || null;
  },

  /**
   * Get all categories
   * @returns {Promise<Array>}
   */
  getAllCategories: async () => {
    const response = await axios.get(`${BASE_URL}/category/get-category`);
    return response.data;
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<object>}
   */
  getCategoryById: async (id) => {
    const response = await axios.get(`${BASE_URL}/category/get-by-id-category/${id}`);
    return response.data;
  },

  /**
   * Get all subcategories
   * @param {string} categoryId - Optional category ID filter
   * @returns {Promise<Array>}
   */
  getAllSubCategories: async (categoryId = null) => {
    const params = categoryId ? { categoryId } : {};
    const response = await axios.get(`${BASE_URL}/subcategory/get-sub-category`, {
      params,
    });
    return response.data;
  },

  /**
   * Get subcategory by ID
   * @param {string} id - Subcategory ID
   * @returns {Promise<object>}
   */
  getSubCategoryById: async (id) => {
    const response = await axios.get(`${BASE_URL}/subcategory/get-by-id-subcategory/${id}`);
    return response.data;
  },

  /**
   * Get all brands
   * @returns {Promise<Array>}
   */
  getAllBrands: async () => {
    const response = await axios.get(`${BASE_URL}/brand/get-brand`);
    return response.data;
  },

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<object>}
   */
  getBrandById: async (id) => {
    const response = await axios.get(`${BASE_URL}/brand/get-by-id-brand/${id}`);
    return response.data;
  },

  /**
   * Get all crops
   * @returns {Promise<Array>}
   */
  getAllCrops: async () => {
    const response = await axios.get(`${BASE_URL}/crop/get-crops`);
    return response.data;
  },

  /**
   * Get crop by ID
   * @param {string} id - Crop ID
   * @returns {Promise<object>}
   */
  getCropById: async (id) => {
    const response = await axios.get(`${BASE_URL}/crop/get-by-id-crop/${id}`);
    return response.data;
  },

  /**
   * Get all pests
   * @returns {Promise<Array>}
   */
  getAllPests: async () => {
    const response = await axios.get(`${BASE_URL}/pest/get-pests`);
    return response.data;
  },
};
