const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const tokenController = require("../controllers/TokenRefreshController");
const adminAuth = require("../middlewares/AdminAuth");

// Authentication routes
router.post("/admin-register", adminAuth, adminController.registerAdmin);
router.post("/admin-login", adminController.loginAdmin);
router.post("/refresh-token", tokenController.refreshAccessToken);
router.post("/logout", tokenController.logout);
router.get("/validate-token", tokenController.validateToken);

// Admin management routes
router.patch("/admin-update/:id", adminAuth, adminController.updateAdmin);
router.get("/get-admin", adminController.getByIdAdmin);

// User management routes
router.get("/users/pending", adminAuth, adminController.getPendingUsers);
router.get("/users", adminAuth, adminController.getUsers);
router.get("/users/:id/cart", adminAuth, adminController.getUserCartAndPayment);
router.get("/users/:id/cart/check", adminAuth, adminController.checkUserCart);
router.patch("/users/:id/approve", adminAuth, adminController.approveUser);
router.patch("/users/:id/reject", adminAuth, adminController.rejectUser);
router.patch("/users/:id/block", adminAuth, adminController.blockUser);
router.patch("/users/:id/unblock", adminAuth, adminController.unblockUser);
router.post("/users", adminAuth, adminController.createUserByAdmin);

module.exports = router;
