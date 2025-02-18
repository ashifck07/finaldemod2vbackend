const express = require("express");
const { deleteImage, deleteDoc } = require("../controllers/imageController");

const router = express.Router();

// Delete image by imageId
router.delete("/images/:imageId", deleteImage);
router.delete("/documents/:imageId", deleteDoc);

module.exports = router;