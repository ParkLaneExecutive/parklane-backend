const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffAddress: {
      type: String,
      required: true,
      trim: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['GLS', 'S-Class', 'V-Class', 'Other'],
      required: true,
    },
    passengers: {
      type: Number,
      default: 1,
    },
    luggage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    estimatedPrice: {
      type: Number,
    },
    finalPrice: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
