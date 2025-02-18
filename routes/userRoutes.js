const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/auth/send-otp", userController.loginUser);
router.post("/auth/verify-otp", userController.loginUser);

// router.post("/register", userController.registerUser);
// router.get("/", userController.getAllUsers);
// router.get("/:userId", userController.getUserById);
// router.put("/:userId", userController.updateUser);
// router.delete("/:userId", userController.deleteUser);

module.exports = router;
