const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const auth = require("../middlewares/Auth");

router.post("/login", userController.loginUser);

router.post("/add-user", auth, userController.createUser);
router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.get("/user-stats", auth, userController.getUserStats);
router.get("/get-user", auth, userController.getAllUsers);
router.get("/get-user-by-id/:id", auth, userController.getUserById);
router.put("/update-user/:id", auth, (req, res, next) => {
    if (req.user.user_type === "admin" || req.user.id === req.params.id) {
        userController.updateUser(req, res, next);
    } else {
        res.status(403).json({ message: "Unauthorized" });
    }5
});
router.delete("/delete-user/:id", auth, (req, res, next) => {
    if (req.user.user_type === "admin") {
        userController.deleteUser(req, res, next);
    } else {
        res.status(403).json({ message: "Unauthorized" });
    }
});

module.exports = router;
