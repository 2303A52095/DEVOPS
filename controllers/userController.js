const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

const ensureDriverRecord = async (user) => {
  if (user.role !== 'driver') {
    return;
  }

  const existing = await Driver.findOne({ user: user._id });

  if (!existing) {
    await Driver.create({
      user: user._id,
      licenseNumber: `DRV-${Date.now()}`,
      vehicleType: 'Bike',
      vehicleNumber: `TEMP-${Date.now().toString().slice(-4)}`,
      availability: 'available'
    });
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.render('users/index', {
      title: 'Users',
      users
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/users');
    }

    user.role = req.body.role;
    await user.save();
    await ensureDriverRecord(user);

    if (user.role !== 'driver') {
      const driverProfile = await Driver.findOne({ user: user._id });

      if (driverProfile) {
        await Ride.updateMany({ driver: driverProfile._id }, { $set: { driver: null, status: 'Pending' } });
        await driverProfile.deleteOne();
      }
    }

    req.flash('success', 'User role updated successfully.');
    return res.redirect('/users');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/users');
    }

    const driverProfile = await Driver.findOne({ user: user._id });

    if (driverProfile) {
      await Ride.updateMany({ driver: driverProfile._id }, { $set: { driver: null, status: 'Pending' } });
      await driverProfile.deleteOne();
    }

    await Ride.deleteMany({ user: user._id });
    await user.deleteOne();

    req.flash('success', 'User deleted successfully.');
    return res.redirect('/users');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  updateUserRole,
  deleteUser
};
