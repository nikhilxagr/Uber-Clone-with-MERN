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
    const ongoingRides = await rideModel.countDocuments({ status: "ongoing" });

    const totalRevenueAggregation = await rideModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fare" } } },
    ]);

    const totalRevenue = totalRevenueAggregation[0]?.total || 0;

    const recentRides = await rideModel
      .find()
      .populate("user")
      .populate("captain")
      .sort({ _id: -1 })
      .limit(10);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalCaptains,
        activeCaptains,
        totalRides,
        completedRides,
        ongoingRides,
        totalRevenue,
      },
      recentRides,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
