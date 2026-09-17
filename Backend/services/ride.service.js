const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const crypto = require("crypto");

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = {
    auto: 30,
    car: 50,
    moto: 20,
  };

  const perKmRate = {
    auto: 10,
    car: 15,
    moto: 8,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    moto: 1.5,
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto,
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car,
    ),
    moto: Math.round(
      baseFare.moto +
        (distanceTime.distance.value / 1000) * perKmRate.moto +
        (distanceTime.duration.value / 60) * perMinuteRate.moto,
    ),
  };

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fare = await getFare(pickup, destination);

  if (!fare[vehicleType]) {
    throw new Error("Invalid vehicle type");
  }

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    vehicleType,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId || !captain) {
    throw new Error("Ride id and captain are required");
  }

  const ride = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        status: "pending",
      },
      {
        status: "accepted",
        captain: captain._id,
      },
      { new: true },
    )
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found or already accepted");
  }

  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp || !captain) {
    throw new Error("Ride id, OTP, and captain are required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  const updatedRide = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        captain: captain._id,
      },
      {
        status: "ongoing",
      },
      { new: true },
    )
    .populate("user")
    .populate("captain")
    .select("+otp");

  return updatedRide;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  const updatedRide = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        captain: captain._id,
      },
      {
        status: "completed",
      },
      { new: true },
    )
    .populate("user")
    .populate("captain")
    .select("+otp");

  return updatedRide;
};

module.exports.makePayment = async ({ rideId, paymentMethod, paymentID }) => {
  if (!rideId) {
    throw new Error("Ride ID is required");
  }

  const generatedPaymentID = paymentID || `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const ride = await rideModel
    .findByIdAndUpdate(
      rideId,
      {
        paymentID: generatedPaymentID,
        orderId: `ORD_${Date.now()}`,
        signature: `SIG_${Math.floor(Math.random() * 1000000)}`,
      },
      { new: true }
    )
    .populate("user")
    .populate("captain");

  return ride;
};

module.exports.getUserRides = async (userId) => {
  return await rideModel
    .find({ user: userId })
    .populate("captain")
    .sort({ _id: -1 });
};

module.exports.getCaptainRides = async (captainId) => {
  return await rideModel
    .find({ captain: captainId })
    .populate("user")
    .sort({ _id: -1 });
};

const reviewModel = require("../models/review.model");

module.exports.createReview = async ({ rideId, userId, captainId, rating, feedback }) => {
  if (!rideId || !rating) {
    throw new Error("Ride ID and rating are required");
  }

  const review = await reviewModel.create({
    ride: rideId,
    user: userId,
    captain: captainId,
    rating,
    feedback,
  });

  return review;
};

module.exports.cancelRide = async ({ rideId, cancelledBy, reason, userId, captainId }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const query = { _id: rideId, status: { $in: ["pending", "accepted"] } };
  if (cancelledBy === "user" && userId) {
    query.user = userId;
  } else if (cancelledBy === "captain" && captainId) {
    query.captain = captainId;
  }

  const ride = await rideModel
    .findOneAndUpdate(
      query,
      {
        status: "cancelled",
        cancelledBy,
        cancelReason: reason || "No reason specified",
      },
      { new: true }
    )
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride cannot be cancelled (may be already ongoing, completed, or cancelled)");
  }

  return ride;
};


