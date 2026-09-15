const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/stats", adminController.getAdminStats);

module.exports = router;
