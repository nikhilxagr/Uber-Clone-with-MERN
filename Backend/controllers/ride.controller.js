const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    try {
      const pickupCoords = await mapService.getAddressCoordinate(pickup);
      const destCoords = await mapService.getAddressCoordinate(destination);

      await rideModel.findByIdAndUpdate(ride._id, {
        pickupCoordinates: pickupCoords,
        destinationCoordinates: destCoords,
      });

      const captainsInRadius = await mapService.getCaptainsInTheRadius(
        pickupCoords.ltd,
        pickupCoords.lng,
        10 // 10km search radius
      );

      const rideWithUser = await rideModel
        .findOne({ _id: ride._id })
        .populate("user");

      captainsInRadius.forEach((captain) => {
        if (!captain.socketId) {
          return;
        }

        sendMessageToSocketId(captain.socketId, {
          event: "new-ride",
          data: rideWithUser,
        });
      });
    } catch (notificationError) {
      console.error("Unable to notify nearby captains:", notificationError.message);
    }

    const updatedRide = await rideModel.findById(ride._id);
    return res.status(201).json(updatedRide || ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.makePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, paymentMethod, paymentID } = req.body;

  try {
    const ride = await rideService.makePayment({
      rideId,
      paymentMethod,
      paymentID,
    });

    if (ride?.captain?.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "payment-received",
        data: ride,
      });
    }

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getUserRides = async (req, res) => {
  try {
    const rides = await rideService.getUserRides(req.user._id);
    return res.status(200).json(rides);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getCaptainRides = async (req, res) => {
  try {
    const rides = await rideService.getCaptainRides(req.captain._id);
    return res.status(200).json(rides);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, captainId, rating, feedback } = req.body;

  try {
    const review = await rideService.createReview({
      rideId,
      userId: req.user._id,
      captainId,
      rating,
      feedback,
    });
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, reason } = req.body;
  const cancelledBy = req.user ? "user" : "captain";
  const userId = req.user?._id;
  const captainId = req.captain?._id;

  try {
    const ride = await rideService.cancelRide({
      rideId,
      cancelledBy,
      reason,
      userId,
      captainId,
    });

    // Notify counterpart via Socket.io
    if (cancelledBy === "user" && ride.captain?.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "ride-cancelled",
        data: {
          rideId: ride._id,
          cancelledBy: "user",
          reason: reason || "Rider cancelled the trip.",
        },
      });
    } else if (cancelledBy === "captain" && ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-cancelled",
        data: {
          rideId: ride._id,
          cancelledBy: "captain",
          reason: reason || "Driver had to cancel the request.",
        },
      });
    }

    return res.status(200).json({ message: "Ride cancelled successfully", ride });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.declineRide = async (req, res) => {
  const { rideId } = req.body;
  const captainId = req.captain?._id;

  try {
    const updatedRide = await rideModel
      .findByIdAndUpdate(
        rideId,
        { $addToSet: { declinedBy: captainId } },
        { new: true }
      )
      .populate("user");

    if (!updatedRide || updatedRide.status !== "pending") {
      return res.status(200).json({ message: "Ride already handled or not pending" });
    }

    // Try finding next available captain in radius who hasn't declined
    if (updatedRide.pickupCoordinates?.ltd && updatedRide.pickupCoordinates?.lng) {
      const allCaptains = await mapService.getCaptainsInTheRadius(
        updatedRide.pickupCoordinates.ltd,
        updatedRide.pickupCoordinates.lng,
        10
      );

      const nextCaptain = allCaptains.find(
        (c) =>
          c.socketId &&
          !updatedRide.declinedBy.some((dId) => dId.equals(c._id))
      );

      if (nextCaptain) {
        sendMessageToSocketId(nextCaptain.socketId, {
          event: "new-ride",
          data: updatedRide,
        });
      }
    }

    return res.status(200).json({ message: "Ride declined and forwarded if available" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


