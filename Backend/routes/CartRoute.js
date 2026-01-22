const express = require("express");
const router = express.Router();
const auth = require("../middlewares/Auth");
const cartController = require("../controllers/CartController");

router.get("/", auth, cartController.getCart);
router.get("/check", auth, cartController.checkCart);
router.put("/", auth, cartController.setCart);
router.post("/items", auth, cartController.addItem);
router.delete("/items/:itemIndex", auth, cartController.removeItem);
router.delete("/clear", auth, cartController.clearCart);

module.exports = router;
