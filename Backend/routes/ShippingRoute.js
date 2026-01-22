const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/ShippingController");
const adminAuth = require("../middlewares/AdminAuth");

// Public routes (for users to check serviceability)
router.get("/check-pincode/:pincode", shippingController.getShippingByPincode);
router.get("/get-states", shippingController.getStates);

// Admin routes (protected) - Static Config Management
router.get("/get-shipping-configs", adminAuth, shippingController.getShippingConfigs);
router.get("/shipping-stats", adminAuth, shippingController.getShippingStats);
router.get("/get-districts/:state", adminAuth, shippingController.getDistricts);
router.post("/add-shipping-config", adminAuth, shippingController.createShippingConfig);
router.put("/update-shipping-config/:id", adminAuth, shippingController.updateShippingConfig);
router.patch("/toggle-serviceable/:id", adminAuth, shippingController.toggleServiceable);
router.delete("/delete-shipping-config/:id", adminAuth, shippingController.deleteShippingConfig);
router.post("/bulk-import", adminAuth, shippingController.bulkImport);

// Admin routes (protected) - Order-Based Shipping Management
router.get("/get-shipping-orders", adminAuth, shippingController.getShippingOrders);
router.get("/shipping-order-stats", adminAuth, shippingController.getShippingOrderStats);
router.put("/update-shipping-status/:id", adminAuth, shippingController.updateShippingStatus);

module.exports = router;
