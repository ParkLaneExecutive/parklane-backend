const Booking = require("../models/Booking");

const estimatePrice = ({ vehicleType }) => {
  const base = 50;
  const multipliers = {
    GLS: 1.4,
    "S-Class": 1.5,
    "V-Class": 1.3,
    Other: 1.0,
  };
  const mult = multipliers[vehicleType] || multipliers.Other;
  return Math.round(base * mult);
};

exports.getQuote = async (req, res) => {
  try {
    const { pickupAddress, dropoffAddress, pickupTime, vehicleType } = req.body;

    if (!pickupAddress || !dropoffAddress || !pickupTime || !vehicleType) {
      return res
        .status(400)
        .json({ message: "pickup, dropoff, time and vehicleType are required" });
    }

    const estimatedPrice = estimatePrice({ vehicleType });
    res.json({ estimatedPrice, currency: "GBP" });
  } catch (err) {
    console.error("Quote error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropoffAddress,
      pickupTime,
      vehicleType,
      passengers,
      luggage,
      notes,
      estimatedPrice,
    } = req.body;

    if (!pickupAddress || !dropoffAddress || !pickupTime || !vehicleType) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      pickupAddress,
      dropoffAddress,
      pickupTime,
      vehicleType,
      passengers,
      luggage,
      notes,
      estimatedPrice: estimatedPrice || estimatePrice({ vehicleType }),
      status: "pending",
    });

    res.status(201).json({ booking });
  } catch (err) {
    console.error("Create booking error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ bookings });
  } catch (err) {
    console.error("Get my bookings error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ booking });
  } catch (err) {
    console.error("Get booking by id error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ booking });
  } catch (err) {
    console.error("Cancel booking error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
