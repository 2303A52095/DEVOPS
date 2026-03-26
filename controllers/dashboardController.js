const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');

const getDashboardData = async (currentUser) => {
  let rideFilter = {};
  let totalUsersQuery = {};
  let totalDriversQuery = {};

  if (currentUser.role === 'user') {
    rideFilter = { user: currentUser._id };
    totalUsersQuery = { _id: currentUser._id };
  }

  if (currentUser.role === 'driver') {
    const driverProfile = await Driver.findOne({ user: currentUser._id }).lean();
    rideFilter = driverProfile ? { driver: driverProfile._id } : { _id: null };
    totalUsersQuery = { _id: currentUser._id };
    totalDriversQuery = { user: currentUser._id };
  }

  const [totalRides, totalUsers, totalDrivers, activeBookings, monthlyStats, rideTypeStats, recentRides] =
    await Promise.all([
      Ride.countDocuments(rideFilter),
      currentUser.role === 'admin' ? User.countDocuments() : User.countDocuments(totalUsersQuery),
      currentUser.role === 'admin' ? Driver.countDocuments() : Driver.countDocuments(totalDriversQuery),
      Ride.countDocuments({ ...rideFilter, status: { $in: ['Pending', 'Accepted'] } }),
      Ride.aggregate([
        { $match: rideFilter },
        {
          $group: {
            _id: { $month: '$rideDate' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Ride.aggregate([
        { $match: rideFilter },
        {
          $group: {
            _id: '$rideType',
            count: { $sum: 1 }
          }
        }
      ]),
      Ride.find(rideFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate({
          path: 'driver',
          populate: { path: 'user', select: 'name' }
        })
        .lean()
    ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ridesPerMonth = months.map((month, index) => {
    const match = monthlyStats.find((item) => item._id === index + 1);
    return match ? match.count : 0;
  });

  const rideTypeCounts = ['Bike', 'Auto', 'Car'].map((type) => {
    const match = rideTypeStats.find((item) => item._id === type);
    return match ? match.count : 0;
  });

  return {
    metrics: {
      totalRides,
      totalUsers,
      totalDrivers,
      activeBookings
    },
    chartData: {
      months,
      ridesPerMonth,
      rideTypes: ['Bike', 'Auto', 'Car'],
      rideTypeCounts
    },
    recentRides
  };
};

const renderDashboard = async (req, res, next) => {
  try {
    const dashboard = await getDashboardData(req.currentUser);
    res.render('dashboard/index', {
      title: 'Dashboard',
      ...dashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  renderDashboard
};
