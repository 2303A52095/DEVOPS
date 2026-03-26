const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const renderProfile = (req, res) => {
  res.render('profile/index', {
    title: 'Profile'
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
    }

    user.name = req.body.name.trim();
    user.email = req.body.email.toLowerCase().trim();

    if (req.file) {
      if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
        const relativePath = user.profilePicture.replace(/^\//, '');
        const existingFile = path.join(__dirname, '..', 'public', relativePath);

        if (fs.existsSync(existingFile)) {
          fs.unlinkSync(existingFile);
        }
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();
    req.session.user.name = user.name;

    req.flash('success', 'Profile updated successfully.');
    return res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.currentUser._id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      req.flash('error', 'Old password is incorrect.');
      return res.redirect('/profile');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirmation do not match.');
      return res.redirect('/profile');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully.');
    return res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  renderProfile,
  updateProfile,
  changePassword
};
