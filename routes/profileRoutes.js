const express = require('express');
const upload = require('../config/multer');
const { renderProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { ensureFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, renderProfile);
router.put('/', isAuthenticated, upload.single('profilePicture'), ensureFields(['name', 'email']), updateProfile);
router.put('/password', isAuthenticated, ensureFields(['oldPassword', 'newPassword', 'confirmPassword']), changePassword);

module.exports = router;
