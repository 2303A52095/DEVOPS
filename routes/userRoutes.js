const express = require('express');
const { listUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { isAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, authorizeRoles('admin'), listUsers);
router.patch('/:id/role', isAuthenticated, authorizeRoles('admin'), updateUserRole);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteUser);

module.exports = router;
