import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Product Service for Customer Store
 * Handles all product-related API calls
 */

export const productService = {
  /**
   * Get user type from localStorage
   * @returns {string} - User type (Farmer, Agri-Retailer, Agent)
   */
  getUserType: () => {
    const userType = localStorage.getItem("userType");
    if (userType) return userType;

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user?.user_type || "Farmer";
      } catch (e) {
        console.error("Error parsing user JSON:", e);
      }
    }
    return "Farmer"; // Default to Farmer
  },

  /**
   * Get all products
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  getAllProducts: async (filters = {}) => {
    const userType = productService.getUserType();
    const response = await axios.get(`${BASE_URL}/product/get-product`, {
      params: {
        ...filters,
        user_type: userType, // Add user_type to query params
      },
    });
    return response.data;
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<object>}
   */
  getProductById: async (id) => {
    const userType = productService.getUserType();
    const response = await axios.get(`${BASE_URL}/product/get-id-product/${id}`, {
      params: { user_type: userType }, // Add user_type to query params
    });
    return response.data;
  },

  /**
   * Get products by super category
   * @param {string} superCatId - Super category ID
   * @returns {Promise<Array>}
   */
  getProductsBySuperCategory: async (superCatId) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    return response.data.filter((product) => product.super_cat_id === superCatId);
  },

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>}
   */
  getProductsByCategory: async (categoryId) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    return response.data.filter((product) => product.category_id === categoryId);
  },

  /**
   * Get products by subcategory
   * @param {string} subCategoryId - Subcategory ID
   * @returns {Promise<Array>}
   */
  getProductsBySubCategory: async (subCategoryId) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    return response.data.filter((product) => product.sub_category_id === subCategoryId);
  },

  /**
   * Get products by brand
   * @param {string} brandId - Brand ID
   * @returns {Promise<Array>}
   */
  getProductsByBrand: async (brandId) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    return response.data.filter((product) => product.brand_id === brandId);
  },

  /**
   * Get products by crop
   * @param {string} cropId - Crop ID
   * @returns {Promise<Array>}
   */
  getProductsByCrop: async (cropId) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    return response.data.filter((product) => product.crop_id === cropId);
  },

  /**
   * Search products by text
   * @param {string} searchText - Search query
   * @returns {Promise<Array>}
   */
  searchProducts: async (searchText) => {
    const response = await axios.get(`${BASE_URL}/product/get-product`);
    const lowerSearch = searchText.toLowerCase();

    return response.data.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerSearch) ||
        product.sub_title.toLowerCase().includes(lowerSearch) ||
        product.description.toLowerCase().includes(lowerSearch)
    );
  },

  /**
   * Get product package data based on user type
   * @param {object} product - Product object
   * @returns {Array} - Package quantities for user's role
   */
  getPackageData: (product) => {
    const userType = localStorage.getItem("userType");

    if (
      userType === "Agri-Retailer" &&
      product.retailer_package_qty &&
      product.retailer_package_qty.length > 0
    ) {
      return product.retailer_package_qty;
    }

    return product.package_qty;
  },

  /**
   * Get first image URL from product
   * @param {object} product - Product object
   * @returns {string} - Image URL
   */
  getFirstImageUrl: (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].imageUrl;
    }
    return product.imageUrl || "";
  },

  /**
   * Check if product is in stock
   * @param {object} product - Product object
   * @returns {boolean}
   */
  isInStock: (product) => {
    if (product.total_stock !== undefined) {
      return product.total_stock > 0;
    }

    const packages = productService.getPackageData(product);
    return packages.some((pkg) => pkg.stock_qty > 0);
  },

  /**
   * Calculate discount percentage
   * @param {number} mrp - MRP price
   * @param {number} sellingPrice - Selling price
   * @returns {number} - Discount percentage
   */
  calculateDiscount: (mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  },
};
