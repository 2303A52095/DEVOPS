const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true
    },
    dropLocation: {
      type: String,
      required: true,
      trim: true
    },
    rideType: {
      type: String,
      enum: ['Bike', 'Auto', 'Car'],
      required: true
    },
    rideDate: {
      type: Date,
      required: true
    },
    distanceKm: {
      type: Number,
      required: true
    },
    fare: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    pickupCoordinates: {
      lat: Number,
      lng: Number
    },
    dropCoordinates: {
      lat: Number,
      lng: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ride', rideSchema);
