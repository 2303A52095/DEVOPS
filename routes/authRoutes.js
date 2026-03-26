const express = require('express');
const { renderLogin, renderRegister, register, login, logout } = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');
const { ensureFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/login', isGuest, renderLogin);
router.get('/register', isGuest, renderRegister);
router.post('/register', isGuest, ensureFields(['name', 'email', 'password', 'confirmPassword', 'role']), register);
router.post('/login', isGuest, ensureFields(['email', 'password']), login);
router.post('/logout', isAuthenticated, logout);

module.exports = router;
