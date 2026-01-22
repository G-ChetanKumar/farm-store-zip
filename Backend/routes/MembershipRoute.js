const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/MembershipController");
const paymentController = require("../controllers/MembershipPaymentController");
const adminAuth = require("../middlewares/AdminAuth");
const auth = require("../middlewares/Auth");
const optionalAuth = require("../middlewares/OptionalAuth");

// Plan management (Admin only)
router.post("/plans", adminAuth, membershipController.createPlan);
router.get("/plans", membershipController.getPlans);
router.put("/plans/:id", adminAuth, membershipController.updatePlan);
router.delete("/plans/:id", adminAuth, membershipController.deletePlan);
router.patch("/plans/:id/toggle", adminAuth, membershipController.togglePlanStatus);

// Subscription management (Admin only)
router.get("/subscriptions", adminAuth, membershipController.getAllSubscriptions);
router.put("/subscriptions/:id", adminAuth, membershipController.updateSubscription);
router.patch("/subscriptions/:id/cancel", adminAuth, membershipController.cancelSubscription);

// Payment & Subscription (User) - Requires authentication
router.post("/create-payment-order", auth, paymentController.createPaymentOrder);
router.post("/verify-payment", auth, paymentController.verifyPaymentAndSubscribe);
router.get("/subscription/:userId", auth, membershipController.getSubscription);

// Legacy subscription endpoint (kept for backward compatibility)
router.post("/subscribe", optionalAuth, membershipController.subscribe);

module.exports = router;
