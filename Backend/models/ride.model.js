const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Captain",
  },
  pickup: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  pickupCoordinates: {
    ltd: { type: Number },
    lng: { type: Number },
  },
  destinationCoordinates: {
    ltd: { type: Number },
    lng: { type: Number },
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["auto", "car", "moto"],
  },
  fare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "arrived", "ongoing", "completed", "cancelled"],
    default: "pending",
  },
  cancelledBy: {
    type: String,
    enum: ["user", "captain"],
  },
  cancelReason: {
    type: String,
  },
  declinedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    },
  ],
  duration: {
    type: Number,
  }, // in seconds
  distance: {
    type: Number,
  }, // in meters
  surgeMultiplier: {
    type: Number,
    default: 1.0,
  },
  paymentID: {
    type: String,
  },
  orderId: {
    type: String,
  },
  signature: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "card", "razorpay"],
    default: "cash",
  },
  otp: {
    type: String,
    select: false,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("ride", rideSchema);
