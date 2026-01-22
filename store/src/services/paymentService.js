import axios from "axios";
import BASE_URL from "../Helper/Helper";

/**
 * Payment Service for Customer Store
 * Handles Razorpay payment integration
 */

export const paymentService = {
  /**
   * Create Razorpay order
   * @param {number} amount - Amount in rupees
   * @param {string} currency - Currency code (default: INR)
   * @returns {Promise<object>}
   */
  createRazorpayOrder: async (amount, currency = "INR") => {
    const response = await axios.post(`${BASE_URL}/razorpay/create-razorpay-order`, {
      amount,
      currency,
    });

    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   * @param {object} paymentData - Payment verification data
   * @returns {Promise<object>}
   */
  verifyPayment: async (paymentData) => {
    const response = await axios.post(
      `${BASE_URL}/razorpay/verify-razorpay-payment`,
      paymentData
    );

    return response.data;
  },

  /**
   * Initialize Razorpay checkout
   * @param {object} options - Razorpay checkout options
   * @returns {Promise<object>}
   */
  initializeCheckout: (options) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      const defaultOptions = {
        key: "rzp_test_lAupy84di3wKt5", // From backend
        name: "Farm E-Store",
        description: "Product Purchase",
        theme: {
          color: "#16a34a", // Green color
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user"));
          },
        },
      };

      const rzp = new window.Razorpay({
        ...defaultOptions,
        ...options,
        handler: function (response) {
          resolve(response);
        },
      });

      rzp.open();
    });
  },

  /**
   * Complete payment flow (Create order + Open checkout + Verify)
   * @param {number} amount - Amount in rupees
   * @param {object} checkoutOptions - Additional checkout options
   * @returns {Promise<object>} - Payment response
   */
  processPayment: async (amount, checkoutOptions = {}) => {
    try {
      // Step 1: Create Razorpay order
      const order = await paymentService.createRazorpayOrder(amount);

      // Step 2: Open Razorpay checkout
      const paymentResponse = await paymentService.initializeCheckout({
        ...checkoutOptions,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      });

      // Step 3: Verify payment
      const verification = await paymentService.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      return {
        success: verification.success,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
      };
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  },
};
