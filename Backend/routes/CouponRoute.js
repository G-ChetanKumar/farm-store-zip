const express = require("express");
const router = express.Router();
const couponController = require("../controllers/CouponController");
const adminAuth = require("../middlewares/AdminAuth");
const auth = require("../middlewares/Auth");

/**
 * IMPORTANT: Routes are matched in order of definition.
 * Specific paths MUST come before parameterized paths.
 */

// Admin routes - specific paths first
router.post("/", adminAuth, couponController.createCoupon); // POST /api/v1/coupons
router.get("/admin/all", adminAuth, couponController.getAllCoupons); // GET /api/v1/coupons/admin/all
router.get("/admin/stats", adminAuth, couponController.getCouponStats); // GET /api/v1/coupons/admin/stats

// User routes - specific paths before params
router.post("/apply", couponController.applyCoupon); // POST /api/v1/coupons/apply (no auth per swagger)

// Admin routes - parameterized paths
router.put("/:id", adminAuth, couponController.updateCoupon); // PUT /api/v1/coupons/:id
router.delete("/:id", adminAuth, couponController.deleteCoupon); // DELETE /api/v1/coupons/:id
router.patch("/:id/toggle", adminAuth, couponController.toggleStatus); // PATCH /api/v1/coupons/:id/toggle

// User routes - parameterized path (must be last to avoid conflicts)
router.get("/:userId", couponController.getCouponsByUser); // GET /api/v1/coupons/:userId (no auth per swagger)

module.exports = router;
