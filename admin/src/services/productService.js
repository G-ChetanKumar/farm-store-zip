import apiClient from "../api/axios";

/**
 * Product Service
 * Handles all product-related API calls
 */

export const productService = {
  /**
   * Get all products
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  getAllProducts: async (filters = {}) => {
    const response = await apiClient.get("/api/product/get-product", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<object>}
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/api/product/get-id-product/${id}`);
    return response.data;
  },

  /**
   * Create new product
   * @param {FormData} formData - Product data with images
   * @returns {Promise<object>}
   */
  createProduct: async (formData) => {
    const response = await apiClient.post("/api/product/add-product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {FormData} formData - Updated product data
   * @returns {Promise<object>}
   */
  updateProduct: async (id, formData) => {
    const response = await apiClient.put(
      `/api/product/update-product/${id}`,
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
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<object>}
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/api/product/delete-product/${id}`);
    return response.data;
  },

  /**
   * Get product variants
   * @param {string} productId - Product ID
   * @returns {Promise<Array>}
   */
  getProductVariants: async (productId) => {
    const response = await apiClient.get(
      `/api/product-variant/product/${productId}/variants`
    );
    return response.data;
  },

  /**
   * Add product variant
   * @param {string} productId - Product ID
   * @param {object} variantData - Variant data
   * @returns {Promise<object>}
   */
  addVariant: async (productId, variantData) => {
    const response = await apiClient.post(
      `/api/product-variant/product/${productId}/variant`,
      variantData
    );
    return response.data;
  },

  /**
   * Update product variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {object} variantData - Updated variant data
   * @returns {Promise<object>}
   */
  updateVariant: async (productId, variantId, variantData) => {
    const response = await apiClient.put(
      `/api/product-variant/product/${productId}/variant/${variantId}`,
      variantData
    );
    return response.data;
  },

  /**
   * Delete product variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @returns {Promise<object>}
   */
  deleteVariant: async (productId, variantId) => {
    const response = await apiClient.delete(
      `/api/product-variant/product/${productId}/variant/${variantId}`
    );
    return response.data;
  },

  /**
   * Update variant stock
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {number} stock - New stock quantity
   * @returns {Promise<object>}
   */
  updateVariantStock: async (productId, variantId, stock) => {
    const response = await apiClient.patch(
      `/api/product-variant/product/${productId}/variant/${variantId}/stock`,
      { stock }
    );
    return response.data;
  },
};
