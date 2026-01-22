const express = require("express");
const router = express.Router();
const kisanCashController = require("../controllers/KisanCashController");
const adminAuth = require("../middlewares/AdminAuth");
const auth = require("../middlewares/Auth");

router.get("/ledger/:userId", auth, kisanCashController.getLedger);
router.post("/earn", adminAuth, kisanCashController.earn);
router.post("/redeem", adminAuth, kisanCashController.redeem);

module.exports = router;
