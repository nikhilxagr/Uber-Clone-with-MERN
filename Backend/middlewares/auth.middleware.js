const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const blackListTokenModel = require("../models/blackListToken.model");
const captainModel = require("../models/captain.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blackListTokenModel.findOne({ token: token });

  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blackListTokenModel.findOne({ token: token });

  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id);

    if (!captain) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.captain = captain;

    return next();
  } catch (err) {
    console.log(err);

    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports.authUserOrCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blackListTokenModel.findOne({ token: token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);
    if (user) {
      req.user = user;
      return next();
    }

    const captain = await captainModel.findById(decoded._id);
    if (captain) {
      req.captain = captain;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports.authAdmin = async (req, res, next) => {
  const token =
    req.cookies?.adminToken ||
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Admin access requires login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expectedEmail = (process.env.ADMIN_EMAIL || "nikhilagrahari517@gmail.com").trim().toLowerCase();

    if (
      decoded.role !== "admin" ||
      (decoded.email && decoded.email.trim().toLowerCase() !== expectedEmail)
    ) {
      return res.status(403).json({ message: "Forbidden: Not an authorized admin" });
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired admin session. Please log in again." });
  }
};
