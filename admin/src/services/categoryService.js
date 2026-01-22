import apiClient from "../api/axios";

/**
 * Category Service
 * Handles all category-related API calls
 */

export const categoryService = {
  // ============ Super Categories ============
  
  /**
   * Get all super categories
   * @returns {Promise<Array>}
   */
  getAllSuperCategories: async () => {
    const response = await apiClient.get("/api/super-category/get-super-category");
    return response.data;
  },

  /**
   * Get super category by ID
   * @param {string} id - Super category ID
   * @returns {Promise<object>}
   */
  getSuperCategoryById: async (id) => {
    const response = await apiClient.get(`/api/super-category/get-by-id-supercategory/${id}`);
    return response.data;
  },

  /**
   * Create super category
   * @param {FormData} formData - Super category data with image
   * @returns {Promise<object>}
   */
  createSuperCategory: async (formData) => {
    const response = await apiClient.post(
      "/api/super-category/add-supercategory",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update super category
   * @param {string} id - Super category ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updateSuperCategory: async (id, formData) => {
    const response = await apiClient.put(
      `/api/super-category/update-supercategory/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete super category
   * @param {string} id - Super category ID
   * @returns {Promise<object>}
   */
  deleteSuperCategory: async (id) => {
    const response = await apiClient.delete(`/api/super-category/delete-supercategory/${id}`);
    return response.data;
  },

  // ============ Categories ============

  /**
   * Get all categories
   * @param {string} superCatId - Optional super category ID filter
   * @returns {Promise<Array>}
   */
  getAllCategories: async (superCatId = null) => {
    const params = superCatId ? { superCatId } : {};
    const response = await apiClient.get("/api/category/get-category", { params });
    return response.data;
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<object>}
   */
  getCategoryById: async (id) => {
    const response = await apiClient.get(`/api/category/get-by-id-category/${id}`);
    return response.data;
  },

  /**
   * Create category
   * @param {FormData} formData - Category data with image
   * @returns {Promise<object>}
   */
  createCategory: async (formData) => {
    const response = await apiClient.post("/api/category/add-category", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updateCategory: async (id, formData) => {
    const response = await apiClient.put(
      `/api/category/update-category/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<object>}
   */
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/api/category/delete-category/${id}`);
    return response.data;
  },

  // ============ Subcategories ============

  /**
   * Get all subcategories
   * @param {string} categoryId - Optional category ID filter
   * @returns {Promise<Array>}
   */
  getAllSubCategories: async (categoryId = null) => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get("/api/subcategory/get-sub-category", {
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
    const response = await apiClient.get(`/api/subcategory/get-by-id-subcategory/${id}`);
    return response.data;
  },

  /**
   * Create subcategory
   * @param {FormData} formData - Subcategory data with image
   * @returns {Promise<object>}
   */
  createSubCategory: async (formData) => {
    const response = await apiClient.post(
      "/api/subcategory/add-subcategory",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update subcategory
   * @param {string} id - Subcategory ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updateSubCategory: async (id, formData) => {
    const response = await apiClient.put(
      `/api/subcategory/update-subcategory/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete subcategory
   * @param {string} id - Subcategory ID
   * @returns {Promise<object>}
   */
  deleteSubCategory: async (id) => {
    const response = await apiClient.delete(`/api/subcategory/delete-subcategory/${id}`);
    return response.data;
  },
};
