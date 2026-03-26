const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { calculateRideMeta } = require('../utils/rideUtils');

const getRideFilters = (currentUser, query) => {
  const filter = {};

  if (currentUser.role === 'user') {
    filter.user = currentUser._id;
  }

  if (currentUser.role === 'driver') {
    filter.driver = currentUser.driverProfile?._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.rideType) {
    filter.rideType = query.rideType;
  }

  return filter;
};

const enrichCurrentUser = async (currentUser) => {
  const driverProfile = await Driver.findOne({ user: currentUser._id }).lean();
  return { ...currentUser, driverProfile };
};

const findAssignableDriver = async (rideType) =>
  Driver.findOne({ vehicleType: rideType, availability: 'available' }).sort({ createdAt: 1 });

const listRides = async (req, res, next) => {
  try {
    const currentUser = await enrichCurrentUser(req.currentUser);
    const filter = getRideFilters(currentUser, req.query);
    const search = (req.query.search || '').trim();
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    if (search) {
      filter.$or = [
        { pickupLocation: new RegExp(search, 'i') },
        { dropLocation: new RegExp(search, 'i') },
        { rideType: new RegExp(search, 'i') },
        { status: new RegExp(search, 'i') }
      ];
    }

    const rides = await Ride.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ [sortField]: sortOrder })
      .lean();

    res.render('rides/index', {
      title: 'Rides',
      rides,
      filters: req.query,
      sortField,
      sortOrder
    });
  } catch (error) {
    next(error);
  }
};

const renderCreateRide = async (req, res, next) => {
  try {
    if (req.currentUser.role === 'driver') {
      req.flash('error', 'Drivers cannot create ride bookings.');
      return res.redirect('/rides');
    }

    const drivers = await Driver.find({ availability: 'available' }).populate('user', 'name').lean();
    res.render('rides/new', {
      title: 'Book Ride',
      drivers
    });
  } catch (error) {
    next(error);
  }
};

const createRide = async (req, res, next) => {
  try {
    if (req.currentUser.role === 'driver') {
      req.flash('error', 'Drivers cannot create ride bookings.');
      return res.redirect('/rides');
    }

    const { pickupLocation, dropLocation, rideType, rideDate, driverId } = req.body;
    const rideMeta = calculateRideMeta({ pickupLocation, dropLocation, rideType });
    let assignedDriver = null;

    if (driverId) {
      assignedDriver = await Driver.findById(driverId);
    }

    if (!assignedDriver) {
      assignedDriver = await findAssignableDriver(rideType);
    }

    const ride = await Ride.create({
      user: req.currentUser._id,
      driver: assignedDriver ? assignedDriver._id : null,
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      rideType,
      rideDate,
      distanceKm: rideMeta.distanceKm,
      fare: rideMeta.fare,
      pickupCoordinates: rideMeta.pickupCoordinates,
      dropCoordinates: rideMeta.dropCoordinates,
      status: assignedDriver ? 'Accepted' : 'Pending'
    });

    await User.findByIdAndUpdate(req.currentUser._id, { $inc: { ridesBooked: 1 } });

    if (assignedDriver) {
      assignedDriver.availability = 'busy';
      await assignedDriver.save();
    }

    req.flash('success', 'Ride booked successfully.');
    res.redirect(`/rides/${ride._id}`);
  } catch (error) {
    next(error);
  }
};

const viewRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    if (!ride) {
      req.flash('error', 'Ride not found.');
      return res.redirect('/rides');
    }

    const isOwner =
      req.currentUser.role === 'admin' ||
      String(ride.user?._id) === String(req.currentUser._id) ||
      String(ride.driver?.user?._id) === String(req.currentUser._id);

    if (!isOwner) {
      req.flash('error', 'You are not allowed to view that ride.');
      return res.redirect('/rides');
    }

    return res.render('rides/show', {
      title: 'Ride Details',
      ride
    });
  } catch (error) {
    next(error);
  }
};

const renderEditRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).lean();

    if (!ride) {
      req.flash('error', 'Ride not found.');
      return res.redirect('/rides');
    }

    const canEdit =
      req.currentUser.role === 'admin' || String(ride.user) === String(req.currentUser._id);

    if (!canEdit) {
      req.flash('error', 'You are not allowed to edit that ride.');
      return res.redirect('/rides');
    }

    const drivers = await Driver.find().populate('user', 'name').lean();

    return res.render('rides/edit', {
      title: 'Edit Ride',
      ride,
      drivers
    });
  } catch (error) {
    next(error);
  }
};

const updateRide = async (req, res, next) => {
  try {
    const { pickupLocation, dropLocation, rideType, rideDate, status, driverId } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      req.flash('error', 'Ride not found.');
      return res.redirect('/rides');
    }

    const canEdit =
      req.currentUser.role === 'admin' || String(ride.user) === String(req.currentUser._id);

    if (!canEdit) {
      req.flash('error', 'You are not allowed to update that ride.');
      return res.redirect('/rides');
    }

    const previousDriverId = ride.driver ? String(ride.driver) : null;

    if (previousDriverId && previousDriverId !== String(driverId || '')) {
      await Driver.findByIdAndUpdate(previousDriverId, { availability: 'available' });
    }

    const rideMeta = calculateRideMeta({ pickupLocation, dropLocation, rideType });
    let assignedDriver = driverId ? await Driver.findById(driverId) : null;

    if (!assignedDriver && status === 'Accepted') {
      assignedDriver = await findAssignableDriver(rideType);
    }

    ride.pickupLocation = pickupLocation.trim();
    ride.dropLocation = dropLocation.trim();
    ride.rideType = rideType;
    ride.rideDate = rideDate;
    ride.status = status;
    ride.driver = assignedDriver ? assignedDriver._id : null;
    ride.distanceKm = rideMeta.distanceKm;
    ride.fare = rideMeta.fare;
    ride.pickupCoordinates = rideMeta.pickupCoordinates;
    ride.dropCoordinates = rideMeta.dropCoordinates;
    await ride.save();

    if (assignedDriver) {
      assignedDriver.availability = status === 'Completed' || status === 'Cancelled' ? 'available' : 'busy';
      await assignedDriver.save();
    }

    req.flash('success', 'Ride updated successfully.');
    return res.redirect(`/rides/${ride._id}`);
  } catch (error) {
    next(error);
  }
};

const cancelRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      req.flash('error', 'Ride not found.');
      return res.redirect('/rides');
    }

    const canCancel =
      req.currentUser.role === 'admin' || String(ride.user) === String(req.currentUser._id);

    if (!canCancel) {
      req.flash('error', 'You are not allowed to cancel that ride.');
      return res.redirect('/rides');
    }

    ride.status = 'Cancelled';
    await ride.save();

    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { availability: 'available' });
    }

    req.flash('success', 'Ride cancelled successfully.');
    return res.redirect(`/rides/${ride._id}`);
  } catch (error) {
    next(error);
  }
};

const deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      req.flash('error', 'Ride not found.');
      return res.redirect('/rides');
    }

    const canDelete =
      req.currentUser.role === 'admin' || String(ride.user) === String(req.currentUser._id);

    if (!canDelete) {
      req.flash('error', 'You are not allowed to delete that ride.');
      return res.redirect('/rides');
    }

    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { availability: 'available' });
    }

    await ride.deleteOne();
    req.flash('success', 'Ride deleted successfully.');
    return res.redirect('/rides');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRides,
  renderCreateRide,
  createRide,
  viewRide,
  renderEditRide,
  updateRide,
  cancelRide,
  deleteRide
};
