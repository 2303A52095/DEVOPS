const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

const listDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email profilePicture lastLogin')
      .sort({ createdAt: -1 })
      .lean();

    res.render('drivers/index', {
      title: 'Drivers',
      drivers
    });
  } catch (error) {
    next(error);
  }
};

const renderNewDriver = (req, res) => {
  res.render('drivers/new', {
    title: 'Add Driver'
  });
};

const createDriver = async (req, res, next) => {
  try {
    const { name, email, password, licenseNumber, vehicleType, vehicleNumber, availability } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      req.flash('error', 'A user with that email already exists.');
      return res.redirect('/drivers/new');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'driver'
    });

    await Driver.create({
      user: user._id,
      licenseNumber: licenseNumber.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber.trim(),
      availability
    });

    req.flash('success', 'Driver created successfully.');
    return res.redirect('/drivers');
  } catch (error) {
    next(error);
  }
};

const assignRide = async (req, res, next) => {
  try {
    const { rideId, status } = req.body;
    const driver = await Driver.findById(req.params.id);
    const ride = await Ride.findById(rideId);

    if (!driver || !ride) {
      req.flash('error', 'Driver or ride not found.');
      return res.redirect('/drivers');
    }

    if (ride.driver && String(ride.driver) !== String(driver._id)) {
      await Driver.findByIdAndUpdate(ride.driver, { availability: 'available' });
    }

    ride.driver = driver._id;
    ride.status = status || 'Accepted';
    await ride.save();

    driver.availability = ride.status === 'Completed' || ride.status === 'Cancelled' ? 'available' : 'busy';
    await driver.save();

    req.flash('success', 'Ride assigned to driver successfully.');
    return res.redirect('/drivers');
  } catch (error) {
    next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      req.flash('error', 'Driver not found.');
      return res.redirect('/drivers');
    }

    await Ride.updateMany({ driver: driver._id }, { $set: { driver: null, status: 'Pending' } });
    await User.findByIdAndDelete(driver.user);
    await driver.deleteOne();

    req.flash('success', 'Driver deleted successfully.');
    return res.redirect('/drivers');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDrivers,
  renderNewDriver,
  createDriver,
  assignRide,
  deleteDriver
};
