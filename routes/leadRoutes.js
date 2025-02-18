const express = require("express");
const leadController = require("../controllers/leadController");
const authMiddleware = require("../middlewares/authorization");

const router = express.Router();

router.post("/", leadController.createLead);
router.get("/", authMiddleware(["master","architect"]), leadController.getAllLeads);
router.get("/architect", authMiddleware(["master", "architect"]), leadController.getLeadByArchitect);
router.patch("/:id", authMiddleware(["master", "architect"]), leadController.updateLeadStatus);
router.get("/:id", authMiddleware(["master", "architect"]), leadController.getLeadById);
router.post("/estimate", leadController.estimateData);
// router.delete("/:id", authMiddleware(["master"]), leadController.deleteLead);

module.exports = router;
