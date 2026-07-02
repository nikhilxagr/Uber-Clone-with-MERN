const captainController = require("../controllers/captain.controllers");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/register",
  [
    body("fullname.firstname")
      .trim()
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("fullname.lastname")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone")
      .optional()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be 10 digits long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Vehicle color must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Vehicle plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Vehicle capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "moto", "auto"])
      .withMessage("Vehicle type must be car, moto, or auto"),
  ],
  captainController.registerCaptain,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain,
);

router.get(
  "/profile",
  authMiddleware.authCaptain,
  captainController.getCaptainProfile,
);
router.get(
  "/logout",
  authMiddleware.authCaptain,
  captainController.logoutCaptain,
);

module.exports = router;
