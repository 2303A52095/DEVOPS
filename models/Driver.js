const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Auto', 'Car'],
      required: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true
    },
    availability: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Driver', driverSchema);
