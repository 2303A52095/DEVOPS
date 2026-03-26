const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { calculateRideMeta } = require('../utils/rideUtils');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexgoride';

const users = [
  {
    name: 'NexGoRide Admin',
    email: 'admin@nexgoride.com',
    password: 'Admin@123',
    role: 'admin',
    lastLogin: new Date()
  },
  {
    name: 'Aarav Rider',
    email: 'user@nexgoride.com',
    password: 'User@123',
    role: 'user',
    lastLogin: new Date(),
    ridesBooked: 2
  },
  {
    name: 'Rohan Driver',
    email: 'driver@nexgoride.com',
    password: 'Driver@123',
    role: 'driver',
    lastLogin: new Date()
  }
];

const seed = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to ${mongoUri}`);

    await Ride.deleteMany({});
    await Driver.deleteMany({});
    await User.deleteMany({});

    const [adminUser, riderUser, driverUser] = await User.create(users);

    const driverProfile = await Driver.create({
      user: driverUser._id,
      licenseNumber: 'KA-DRV-90876',
      vehicleType: 'Car',
      vehicleNumber: 'KA01AB1234',
      availability: 'busy'
    });

    const acceptedRideMeta = calculateRideMeta({
      pickupLocation: 'MG Road, Bengaluru',
      dropLocation: 'Koramangala, Bengaluru',
      rideType: 'Car'
    });

    const pendingRideMeta = calculateRideMeta({
      pickupLocation: 'Indiranagar, Bengaluru',
      dropLocation: 'Airport Road, Bengaluru',
      rideType: 'Bike'
    });

    const completedRideMeta = calculateRideMeta({
      pickupLocation: 'Whitefield, Bengaluru',
      dropLocation: 'Electronic City, Bengaluru',
      rideType: 'Auto'
    });

    await Ride.create([
      {
        user: riderUser._id,
        driver: driverProfile._id,
        pickupLocation: 'MG Road, Bengaluru',
        dropLocation: 'Koramangala, Bengaluru',
        rideType: 'Car',
        rideDate: new Date(Date.now() + 1000 * 60 * 60),
        distanceKm: acceptedRideMeta.distanceKm,
        fare: acceptedRideMeta.fare,
        pickupCoordinates: acceptedRideMeta.pickupCoordinates,
        dropCoordinates: acceptedRideMeta.dropCoordinates,
        status: 'Accepted'
      },
      {
        user: riderUser._id,
        pickupLocation: 'Indiranagar, Bengaluru',
        dropLocation: 'Airport Road, Bengaluru',
        rideType: 'Bike',
        rideDate: new Date(Date.now() + 1000 * 60 * 60 * 5),
        distanceKm: pendingRideMeta.distanceKm,
        fare: pendingRideMeta.fare,
        pickupCoordinates: pendingRideMeta.pickupCoordinates,
        dropCoordinates: pendingRideMeta.dropCoordinates,
        status: 'Pending'
      },
      {
        user: riderUser._id,
        driver: driverProfile._id,
        pickupLocation: 'Whitefield, Bengaluru',
        dropLocation: 'Electronic City, Bengaluru',
        rideType: 'Auto',
        rideDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        distanceKm: completedRideMeta.distanceKm,
        fare: completedRideMeta.fare,
        pickupCoordinates: completedRideMeta.pickupCoordinates,
        dropCoordinates: completedRideMeta.dropCoordinates,
        status: 'Completed'
      }
    ]);

    console.log('Seed data created successfully.');
    console.log('Admin login: admin@nexgoride.com / Admin@123');
    console.log('User login: user@nexgoride.com / User@123');
    console.log('Driver login: driver@nexgoride.com / Driver@123');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
