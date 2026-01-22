const express = require("express");
const router = express.Router();
const auth = require("../middlewares/Auth");
const optionalAuth = require("../middlewares/OptionalAuth");
const adminAuth = require("../middlewares/AdminAuth");
const paymentController = require("../controllers/PaymentController");

// Payment creation routes
router.post("/create-order", auth, paymentController.createSimpleOrder);
router.post("/create-gateway-order", auth, paymentController.createGatewayOrder);
router.post("/webhook", paymentController.verifyWebhook);

// Admin payment management routes
router.get("/get-payments", adminAuth, paymentController.getPayments);
router.get("/payment-stats", adminAuth, paymentController.getPaymentStats);
router.post("/process-refund/:id", adminAuth, paymentController.processRefund);

// Return/Refund request routes (Customer-initiated)
// Using optionalAuth for graceful auth handling - switch to 'auth' for production
router.post("/request-return/:orderId", optionalAuth, paymentController.requestReturn);
router.get("/my-return-requests", optionalAuth, paymentController.getMyReturnRequests);

// Admin return management routes
router.get("/return-requests", adminAuth, paymentController.getAllReturnRequests);
router.get("/return-stats", adminAuth, paymentController.getReturnStats);
router.post("/approve-return/:requestId", adminAuth, paymentController.approveReturn);
router.post("/reject-return/:requestId", adminAuth, paymentController.rejectReturn);
router.post("/process-return-refund/:requestId", adminAuth, paymentController.processReturnRefund);

module.exports = router;
