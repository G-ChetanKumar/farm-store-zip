const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderContoller");
const unifiedAuth = require("../middlewares/UnifiedAuth");

router.post("/add-order", unifiedAuth, orderController.createOrder);
router.get("/get-orders", unifiedAuth, orderController.getOrders);
router.get("/get-order-by-id/:id", unifiedAuth, orderController.getOrderById);
router.put("/update-order/:id", unifiedAuth, orderController.updateOrder);
router.delete("/delete-order/:id", unifiedAuth, orderController.deleteOrder);

module.exports = router;
