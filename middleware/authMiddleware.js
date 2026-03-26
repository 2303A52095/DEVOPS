const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      req.flash('error', 'Please log in to continue.');
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user.id).lean();

    if (!user) {
      req.session.destroy(() => {});
      req.flash('error', 'Your session has expired. Please log in again.');
      return res.redirect('/login');
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

const isGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }

  next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  const role = req.currentUser?.role || req.session.user?.role;

  if (!roles.includes(role)) {
    req.flash('error', 'You do not have permission to access that page.');
    return res.redirect('/dashboard');
  }

  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
  authorizeRoles
};
