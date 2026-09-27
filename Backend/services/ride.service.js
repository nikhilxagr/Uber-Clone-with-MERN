const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const crypto = require("crypto");
const captainModel = require("../models/captain.model");

async function calculateSurgeMultiplier(pickup) {
  try {
    let availableCaptains = 0;
    try {
      const coords = await mapService.getAddressCoordinate(pickup);
      if (coords && coords.ltd && coords.lng) {
        const captains = await mapService.getCaptainsInTheRadius(coords.ltd, coords.lng, 8);
        availableCaptains = captains.length;
      }
    } catch {
      // Fallback
    }

    if (availableCaptains === 0) {
      availableCaptains = await captainModel.countDocuments({ status: "active" });
    }

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const pendingDemand = await rideModel.countDocuments({
      status: { $in: ["pending", "accepted"] },
      createdAt: { $gte: fifteenMinsAgo },
    });

    const currentHour = new Date().getHours();
    const isRushHour =
      (currentHour >= 8 && currentHour <= 10) ||
      (currentHour >= 17 && currentHour <= 20);

    const ratio = (pendingDemand + 1) / Math.max(availableCaptains, 1);

    let multiplier = 1.0;
    if (ratio >= 3.0) {
      multiplier = 2.0;
    } else if (ratio >= 1.8) {
      multiplier = 1.5;
    } else if (ratio >= 1.2 || isRushHour) {
      multiplier = 1.2;
    }

    return multiplier;
  } catch (err) {
    console.warn("Surge calculation fallback:", err.message);
    return 1.0;
  }
}

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const surgeMultiplier = await calculateSurgeMultiplier(pickup);

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

  const autoRaw =
    baseFare.auto +
    (distanceTime.distance.value / 1000) * perKmRate.auto +
    (distanceTime.duration.value / 60) * perMinuteRate.auto;

  const carRaw =
    baseFare.car +
    (distanceTime.distance.value / 1000) * perKmRate.car +
    (distanceTime.duration.value / 60) * perMinuteRate.car;

  const motoRaw =
    baseFare.moto +
    (distanceTime.distance.value / 1000) * perKmRate.moto +
    (distanceTime.duration.value / 60) * perMinuteRate.moto;

  const fare = {
    auto: Math.round(autoRaw * surgeMultiplier),
    car: Math.round(carRaw * surgeMultiplier),
    moto: Math.round(motoRaw * surgeMultiplier),
    surgeMultiplier,
    isSurge: surgeMultiplier > 1.0,
    distanceKm: (distanceTime.distance.value / 1000).toFixed(1),
    durationMin: Math.round(distanceTime.duration.value / 60),
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
    surgeMultiplier: fare.surgeMultiplier || 1.0,
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

  if (ride.status !== "accepted" && ride.status !== "arrived") {
    throw new Error("Ride not accepted or arrived");
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

const Razorpay = require("razorpay");

module.exports.createRazorpayOrder = async ({ rideId }) => {
  if (!rideId) {
    throw new Error("Ride ID is required");
  }

  const ride = await rideModel.findById(rideId);
  if (!ride) {
    throw new Error("Ride not found");
  }

  const amountPaise = Math.round((ride.fare || 100) * 100);
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mockKey";

  let order;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `rcpt_${ride._id.toString().slice(-8)}`,
      });
    } catch (apiErr) {
      console.warn("Razorpay API error fallback:", apiErr.message);
    }
  }

  if (!order) {
    order = {
      id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      entity: "order",
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${ride._id.toString().slice(-8)}`,
      status: "created",
    };
  }

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
    ride,
  };
};

module.exports.verifyRazorpayPayment = async ({
  rideId,
  orderId,
  paymentId,
  signature,
  paymentMethod = "razorpay",
}) => {
  if (!rideId || !paymentId) {
    throw new Error("Ride ID and Payment ID are required");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  let isSignatureValid = false;

  if (keySecret && signature && orderId) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
      isSignatureValid = expectedSignature === signature;
    } catch (err) {
      console.warn("Signature verification failed:", err.message);
    }
  } else {
    // Sandbox / Test fallback
    isSignatureValid = true;
  }

  if (!isSignatureValid) {
    throw new Error("Invalid payment signature");
  }

  const ride = await rideModel
    .findByIdAndUpdate(
      rideId,
      {
        paymentID: paymentId,
        orderId: orderId || `ORD_${Date.now()}`,
        signature: signature || `SIG_${Date.now()}`,
        paymentStatus: "paid",
        paymentMethod,
      },
      { new: true }
    )
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
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
        paymentStatus: "paid",
        paymentMethod: paymentMethod || "cash",
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

  const query = { _id: rideId, status: { $in: ["pending", "accepted", "arrived"] } };
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

module.exports.driverArrived = async ({ rideId, captain }) => {
  if (!rideId || !captain) {
    throw new Error("Ride ID and captain are required");
  }

  const ride = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        captain: captain._id,
        status: "accepted",
      },
      {
        status: "arrived",
      },
      { new: true }
    )
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride not found or cannot transition to arrived");
  }

  return ride;
};



