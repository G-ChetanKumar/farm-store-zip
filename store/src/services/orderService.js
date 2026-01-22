import apiClient from "../api/axios";

/**
 * Order Service for Customer Store
 * Handles all order-related API calls
 * NOTE: Now uses apiClient which automatically handles authentication
 */

export const orderService = {
  /**
   * Create new order
   * @param {object} orderData - Order data
   * @returns {Promise<object>}
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post("/order/add-order", orderData);
    return response.data;
  },

  /**
   * Get all orders for current user
   * @returns {Promise<Array>}
   */
  getMyOrders: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
      throw new Error("User not found");
    }

    const response = await apiClient.get("/order/get-orders", {
      params: {
        user_id: user.id,
      },
    });

    return response.data;
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<object>}
   */
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/order/get-order-by-id/${orderId}`);
    return response.data;
  },

  /**
   * Get orders by status
   * @param {string} status - Order status (pending, shipment, delivered)
   * @returns {Promise<Array>}
   */
  getOrdersByStatus: async (status) => {
    const orders = await orderService.getMyOrders();
    return orders.filter((order) => order.order_status === status);
  },

  /**
   * Request return/refund for an order
   * @param {string} orderId - Order ID
   * @param {object} returnData - Return request data
   * @returns {Promise<object>}
   */
  requestReturn: async (orderId, returnData) => {
    const response = await apiClient.post(`/payment/request-return/${orderId}`, returnData);
    return response.data;
  },

  /**
   * Get my return requests
   * @returns {Promise<Array>}
   */
  getMyReturnRequests: async () => {
    const response = await apiClient.get("/payment/my-return-requests");
    return response.data;
  },
};
