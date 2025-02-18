const express = require("express");
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authorization");

const router = express.Router();

//  router.post("/", authMiddleware(["master","architect"]), architectController.createArchitect);
// router.get("/", architectController.getArchitects);
router.post("/auth/send-otp", customerController.loginCustomer);
router.post("/auth/verify-otp", customerController.loginCustomer);
router.get("/:id", customerController.getCustomerById);
router.post('/approval/:id',authMiddleware(["customer"]),customerController.designApproval)
// router.put("/:id", architectController.updateArchitect);
module.exports = router;
