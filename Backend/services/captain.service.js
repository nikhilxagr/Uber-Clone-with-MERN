const captainModel = require('../models/captain.model');
const rideModel = require('../models/ride.model');
const reviewModel = require('../models/review.model');

module.exports.createCaptain = async (captainData) => {
    const { fullname, email, password, phone, vehicle, location } = captainData;

    if (!fullname || !email || !password || !vehicle) {
        throw new Error('All fields are required');
    }

    return captainModel.create({
        fullname,
        email,
        password,
        phone,
        vehicle,
        location
    });
};

module.exports.loginCaptain = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
};

module.exports.getCaptainEarnings = async (captainId) => {
    if (!captainId) {
        throw new Error('Captain ID is required');
    }

    const completedRides = await rideModel
        .find({ captain: captainId, status: "completed" })
        .populate("user", "fullName email")
        .sort({ _id: -1 });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todayEarnings = 0;
    let todayRidesCount = 0;
    let weeklyEarnings = 0;
    let weeklyRidesCount = 0;
    let totalEarnings = 0;
    let totalDurationSec = 0;
    let totalDistanceMeters = 0;

    completedRides.forEach((ride) => {
        const fare = Number(ride.fare) || 0;
        totalEarnings += fare;

        const rideDate = ride.createdAt || (ride._id ? ride._id.getTimestamp() : now);

        if (rideDate >= startOfToday) {
            todayEarnings += fare;
            todayRidesCount++;
        }

        if (rideDate >= startOfWeek) {
            weeklyEarnings += fare;
            weeklyRidesCount++;
        }

        if (ride.duration) {
            totalDurationSec += Number(ride.duration);
        } else {
            totalDurationSec += 1200; // ~20 mins estimated average
        }

        if (ride.distance) {
            totalDistanceMeters += Number(ride.distance);
        }
    });

    const reviews = await reviewModel.find({ captain: captainId });
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : "5.0";

    const totalHours = totalDurationSec > 0 ? (totalDurationSec / 3600).toFixed(1) : "0.0";
    const totalDistanceKm = totalDistanceMeters > 0 ? (totalDistanceMeters / 1000).toFixed(1) : (completedRides.length * 5.2).toFixed(1);

    return {
        todayEarnings: Math.round(todayEarnings * 100) / 100,
        weeklyEarnings: Math.round(weeklyEarnings * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        todayRidesCount,
        weeklyRidesCount,
        totalRidesCount: completedRides.length,
        totalHours: parseFloat(totalHours),
        totalDistanceKm: parseFloat(totalDistanceKm),
        rating: parseFloat(avgRating),
        reviewsCount: reviews.length,
        recentCompletedRides: completedRides.slice(0, 5),
    };
};
