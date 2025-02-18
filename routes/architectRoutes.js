const express = require("express");
const architectController = require("../controllers/architectController");
const authMiddleware = require("../middlewares/authorization");

const router = express.Router();

router.post("/", authMiddleware(["master"]), architectController.createArchitect);
router.get("/", architectController.getArchitects);
router.post("/auth/send-otp", architectController.loginUser);
router.post("/auth/verify-otp", architectController.loginUser);
// router.get("/", authMiddleware(['master']), architectController.getArchitects);
router.get("/:id", architectController.getArchitectById);
router.put("/:id", architectController.updateArchitect);
router.delete("/:id", authMiddleware(["master"]), architectController.deleteArchitect);

module.exports = router;
