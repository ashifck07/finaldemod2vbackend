const express = require("express");
const workProgressController = require("../controllers/workProgressController");
const authMiddleware = require("../middlewares/authorization");
const multer = require("multer");

// Multer middleware for handling multipart/form-data (image upload)
const upload = multer({storage: multer.memoryStorage()}).array("img"); // 'img' will be the field name in the form
const router = express.Router();

router.post("/", upload, workProgressController.createWorkProgress);
router.patch("/:id",authMiddleware(["master", "architect"]), upload, workProgressController.updateWorkProgress);
router.get("/", authMiddleware(["master", "architect"]), workProgressController.getAllWorkProgresses);

router.get("/:id",authMiddleware(["master", "architect"]), workProgressController.getWorkProgressById);
router.delete("/:id", workProgressController.deleteWorkProgress);

module.exports = router;
