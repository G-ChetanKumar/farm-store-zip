import apiClient from "../api/axios";

/**
 * Cart Service for Customer Store
 * Handles shopping cart operations
 */

export const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise<object>}
   */
  getCart: async () => {
    const response = await apiClient.get("/v1/cart");
    return response.data;
  },

  /**
   * Add item to cart
   * @param {object} item - Cart item { product_id, variant_id, qty, unit_price, original_price, commission }
   * @returns {Promise<object>}
   */
  addItem: async (item) => {
    const response = await apiClient.post("/v1/cart/items", item);
    return response.data;
  },

  /**
   * Remove item from cart by index
   * @param {number} itemIndex - Item index in cart
   * @returns {Promise<object>}
   */
  removeItem: async (itemIndex) => {
    const response = await apiClient.delete(`/v1/cart/items/${itemIndex}`);
    return response.data;
  },

  /**
   * Update entire cart
   * @param {Array} items - Array of cart items
   * @returns {Promise<object>}
   */
  updateCart: async (items) => {
    const response = await apiClient.put("/v1/cart", { items });
    return response.data;
  },

  /**
   * Clear cart
   * @returns {Promise<object>}
   */
  clearCart: async () => {
    const response = await apiClient.delete("/v1/cart/clear");
    return response.data;
  },

  /**
   * Check cart validity (stock, prices, availability)
   * @returns {Promise<object>} - { success, valid, data, issues, has_issues }
   */
  checkCart: async () => {
    const response = await apiClient.get("/v1/cart/check");
    return response.data;
  },

  /**
   * Update item quantity
   * @param {number} itemIndex - Item index
   * @param {number} newQty - New quantity
   * @returns {Promise<object>}
   */
  updateItemQuantity: async (itemIndex, newQty) => {
    const cart = await cartService.getCart();
    if (cart.success && cart.data && cart.data.items) {
      const items = [...cart.data.items];
      if (items[itemIndex]) {
        items[itemIndex].qty = newQty;
        return await cartService.updateCart(items);
      }
    }
    throw new Error("Item not found in cart");
  },

  /**
   * Calculate cart totals
   * @param {Array} items - Cart items
   * @returns {object} - { subtotal, totalItems, totalQty }
   */
  calculateTotals: (items) => {
    if (!items || !Array.isArray(items)) {
      return { subtotal: 0, totalItems: 0, totalQty: 0 };
    }

    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.qty, 0);
    const totalItems = items.length;
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

    return { subtotal, totalItems, totalQty };
  },

  /**
   * Find item in cart
   * @param {Array} items - Cart items
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @returns {number} - Item index or -1 if not found
   */
  findItem: (items, productId, variantId = null) => {
    if (!items || !Array.isArray(items)) return -1;

    return items.findIndex((item) => {
      const productMatch = item.product_id === productId;
      const variantMatch = variantId ? item.variant_id === variantId : true;
      return productMatch && variantMatch;
    });
  },

  /**
   * Check if product is in cart
   * @param {Array} items - Cart items
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @returns {boolean}
   */
  isInCart: (items, productId, variantId = null) => {
    return cartService.findItem(items, productId, variantId) !== -1;
  },

  /**
   * Get item quantity in cart
   * @param {Array} items - Cart items
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @returns {number} - Quantity or 0 if not in cart
   */
  getItemQuantity: (items, productId, variantId = null) => {
    const index = cartService.findItem(items, productId, variantId);
    return index !== -1 ? items[index].qty : 0;
  },
};
