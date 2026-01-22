const express = require("express");
const router = express.Router();
const userCounterController = require("../controllers/UserCounterController");

/**
 * User Counter Selection Routes
 * Manages user's preferred counter/store selection
 */

// Set user's preferred counter
router.post("/set-preferred-counter", userCounterController.setPreferredCounter);

// Get user's preferred counter
router.get("/get-preferred-counter/:userId", userCounterController.getPreferredCounter);

// Get all users for a specific counter (Admin)
router.get("/counter-users/:counterId", userCounterController.getUsersByCounter);

// Get counter statistics (Admin)
router.get("/counter-stats", userCounterController.getCounterStats);

// Clear user's preferred counter
router.post("/clear-preferred-counter", userCounterController.clearPreferredCounter);

module.exports = router;
