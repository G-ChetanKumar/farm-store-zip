const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const userTokenController = require("../controllers/UserTokenRefreshController");

// OTP Authentication for Users (Farmer, Agent, Retailer)
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/complete-profile", authController.completeProfile);

// Token Management for Users
router.post("/refresh-token", userTokenController.refreshAccessToken);
router.post("/logout", userTokenController.logout);
router.get("/validate-token", userTokenController.validateToken);

module.exports = router;
