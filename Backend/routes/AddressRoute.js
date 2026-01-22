const express = require("express");
const router = express.Router();
const auth = require("../middlewares/Auth");
const addressController = require("../controllers/AddressController");

router.post("/", auth, addressController.addAddress);
router.get("/", auth, addressController.getAddresses);
router.put("/:id", auth, addressController.updateAddress);
router.delete("/:id", auth, addressController.deleteAddress);
router.patch("/:id/default", auth, addressController.setDefaultAddress);

module.exports = router;
