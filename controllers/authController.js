const User = require('../models/User');
const Driver = require('../models/Driver');

const renderLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

const renderRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/register');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: ['admin', 'user', 'driver'].includes(role) ? role : 'user'
    });

    if (user.role === 'driver') {
      await Driver.create({
        user: user._id,
        licenseNumber: `DRV-${Date.now()}`,
        vehicleType: 'Bike',
        vehicleNumber: `TEMP-${Date.now().toString().slice(-4)}`,
        availability: 'available'
      });
    }

    req.flash('success', 'Registration successful. Please log in.');
    return res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    user.lastLogin = new Date();
    await user.save();

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role
    };

    req.flash('success', `Welcome back, ${user.name}.`);
    return res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

module.exports = {
  renderLogin,
  renderRegister,
  register,
  login,
  logout
};
