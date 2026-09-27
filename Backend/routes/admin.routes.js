const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/stats", adminController.getAdminStats);
router.get("/fleet", adminController.getAdminFleet);
router.post("/toggle-driver-status", adminController.toggleDriverStatus);

module.exports = router;
