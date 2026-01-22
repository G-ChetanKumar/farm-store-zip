import apiClient from "../api/axios";

/**
 * Brand, Crop, and Pest Service
 * Handles all brand, crop, and pest-related API calls
 */

export const brandService = {
  // ============ Brands ============

  /**
   * Get all brands
   * @returns {Promise<Array>}
   */
  getAllBrands: async () => {
    const response = await apiClient.get("/api/brand/get-brand");
    return response.data;
  },

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<object>}
   */
  getBrandById: async (id) => {
    const response = await apiClient.get(`/api/brand/get-by-id-brand/${id}`);
    return response.data;
  },

  /**
   * Create brand
   * @param {FormData} formData - Brand data with image
   * @returns {Promise<object>}
   */
  createBrand: async (formData) => {
    const response = await apiClient.post("/api/brand/add-brand", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update brand
   * @param {string} id - Brand ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updateBrand: async (id, formData) => {
    const response = await apiClient.put(`/api/brand/update-brand/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete brand
   * @param {string} id - Brand ID
   * @returns {Promise<object>}
   */
  deleteBrand: async (id) => {
    const response = await apiClient.delete(`/api/brand/delete-brand/${id}`);
    return response.data;
  },

  // ============ Crops ============

  /**
   * Get all crops
   * @returns {Promise<Array>}
   */
  getAllCrops: async () => {
    const response = await apiClient.get("/api/crop/get-crops");
    return response.data;
  },

  /**
   * Get crop by ID
   * @param {string} id - Crop ID
   * @returns {Promise<object>}
   */
  getCropById: async (id) => {
    const response = await apiClient.get(`/api/crop/get-by-id-crop/${id}`);
    return response.data;
  },

  /**
   * Create crop
   * @param {FormData} formData - Crop data with image
   * @returns {Promise<object>}
   */
  createCrop: async (formData) => {
    const response = await apiClient.post("/api/crop/add-crop", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update crop
   * @param {string} id - Crop ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updateCrop: async (id, formData) => {
    const response = await apiClient.put(`/api/crop/update-crop/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete crop
   * @param {string} id - Crop ID
   * @returns {Promise<object>}
   */
  deleteCrop: async (id) => {
    const response = await apiClient.delete(`/api/crop/delete-crop/${id}`);
    return response.data;
  },

  // ============ Pests ============

  /**
   * Get all pests
   * @returns {Promise<Array>}
   */
  getAllPests: async () => {
    const response = await apiClient.get("/api/pest/get-pests");
    return response.data;
  },

  /**
   * Get pest by ID
   * @param {string} id - Pest ID
   * @returns {Promise<object>}
   */
  getPestById: async (id) => {
    const response = await apiClient.get(`/api/pest/get-by-id-pest/${id}`);
    return response.data;
  },

  /**
   * Create pest
   * @param {FormData} formData - Pest data with image
   * @returns {Promise<object>}
   */
  createPest: async (formData) => {
    const response = await apiClient.post("/api/pest/add-pest", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update pest
   * @param {string} id - Pest ID
   * @param {FormData} formData - Updated data
   * @returns {Promise<object>}
   */
  updatePest: async (id, formData) => {
    const response = await apiClient.put(`/api/pest/update-pest/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete pest
   * @param {string} id - Pest ID
   * @returns {Promise<object>}
   */
  deletePest: async (id) => {
    const response = await apiClient.delete(`/api/pest/delete-pest/${id}`);
    return response.data;
  },
};
