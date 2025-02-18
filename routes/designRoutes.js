
const express = require("express");
const designController = require("../controllers/designControllers");
const authMiddleware = require("../middlewares/authorization");
const multer = require("multer");
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
}).fields([
  {name: "img"}, 
  {name: "premiumdoc", maxCount: 5}, 
  {name: "luxurydoc", maxCount: 5}, 
]);

router.post("/", upload, authMiddleware(["master"]), designController.createDesign);
router.get("/", designController.getAllDesigns);
router.get("/:id", designController.getDesignById);
router.patch("/:id", upload, authMiddleware(["master", "architect"]), designController.updateDesign);
router.delete("/:id", designController.deleteDesign);
router.get("/architect", authMiddleware(["master"], ["architect"]), designController.getDesignByArchitect);
router.patch("/edit/:id",designController.updateCustomerData)
module.exports = router;
