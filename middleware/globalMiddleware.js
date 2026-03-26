const User = require('../models/User');

const injectGlobals = async (req, res, next) => {
  try {
    res.locals.currentPath = req.originalUrl.split('?')[0];
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    res.locals.currentUser = null;

    if (req.session.user?.id) {
      const user = await User.findById(req.session.user.id).lean();

      if (user) {
        req.session.user.role = user.role;
        req.currentUser = user;
        res.locals.currentUser = user;
      } else {
        req.session.destroy(() => {});
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { injectGlobals };
