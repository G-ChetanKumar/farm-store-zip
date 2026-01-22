import apiClient from "../api/axios";

/**
 * Order Service
 * Handles all order-related API calls
 */

export const orderService = {
  /**
   * Get all orders
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  getAllOrders: async (filters = {}) => {
    const response = await apiClient.get("/api/order/get-orders", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<object>}
   */
  getOrderById: async (id) => {
    const response = await apiClient.get(`/api/order/get-order-by-id/${id}`);
    return response.data;
  },

  /**
   * Create new order
   * @param {object} orderData - Order data
   * @returns {Promise<object>}
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post("/api/order/add-order", orderData);
    return response.data;
  },

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {object} orderData - Updated order data
   * @returns {Promise<object>}
   */
  updateOrder: async (id, orderData) => {
    const response = await apiClient.put(`/api/order/update-order/${id}`, orderData);
    return response.data;
  },

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise<object>}
   */
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/api/order/delete-order/${id}`);
    return response.data;
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status (pending, shipment, delivered)
   * @returns {Promise<object>}
   */
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/api/order/update-order/${id}`, {
      order_status: status,
    });
    return response.data;
  },
};
