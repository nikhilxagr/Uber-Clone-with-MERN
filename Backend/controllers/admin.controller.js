const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");

module.exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalCaptains = await captainModel.countDocuments();
    const activeCaptains = await captainModel.countDocuments({ status: "active" });
    const totalRides = await rideModel.countDocuments();
    const completedRides = await rideModel.countDocuments({ status: "completed" });
    const ongoingRides = await rideModel.countDocuments({ status: { $in: ["ongoing", "accepted", "arrived"] } });
    const cancelledRides = await rideModel.countDocuments({ status: "cancelled" });

    const totalRevenueAggregation = await rideModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fare" } } },
    ]);

    const totalRevenue = totalRevenueAggregation[0]?.total || 0;

    // Check surge activity across ongoing/recent trips
    const recentRides = await rideModel
      .find()
      .populate("user")
      .populate("captain")
      .sort({ _id: -1 })
      .limit(15);

    const surgeTripsCount = recentRides.filter((r) => r.surgeMultiplier && r.surgeMultiplier > 1.0).length;
    const currentSurgeStatus = surgeTripsCount > 0 ? "SURGE ACTIVE" : "NORMAL";

    return res.status(200).json({
      stats: {
        totalUsers,
        totalCaptains,
        activeCaptains,
        totalRides,
        completedRides,
        ongoingRides,
        cancelledRides,
        totalRevenue,
        currentSurgeStatus,
        surgeTripsCount,
      },
      recentRides,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAdminFleet = async (req, res) => {
  try {
    const captains = await captainModel
      .find()
      .select("-password")
      .sort({ status: 1 });

    const activeTrips = await rideModel
      .find({ status: { $in: ["accepted", "arrived", "ongoing"] } })
      .populate("user", "fullName email")
      .populate("captain", "fullname vehicle");

    return res.status(200).json({
      captains,
      activeTrips,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.toggleDriverStatus = async (req, res) => {
  const { captainId } = req.body;
  if (!captainId) {
    return res.status(400).json({ message: "Captain ID is required" });
  }

  try {
    const captain = await captainModel.findById(captainId);
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    captain.status = captain.status === "active" ? "inactive" : "active";
    await captain.save();

    return res.status(200).json({
      message: `Driver status switched to ${captain.status}`,
      captain,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
