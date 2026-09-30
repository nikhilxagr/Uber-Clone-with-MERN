const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/login", adminController.loginAdmin);
router.get("/profile", authMiddleware.authAdmin, adminController.getAdminProfile);
router.get("/stats", authMiddleware.authAdmin, adminController.getAdminStats);
router.get("/fleet", authMiddleware.authAdmin, adminController.getAdminFleet);
router.post("/toggle-driver-status", authMiddleware.authAdmin, adminController.toggleDriverStatus);

module.exports = router;

