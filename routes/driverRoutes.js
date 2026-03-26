const express = require('express');
const {
  listDrivers,
  renderNewDriver,
  createDriver,
  assignRide,
  deleteDriver
} = require('../controllers/driverController');
const { isAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');
const { ensureFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, authorizeRoles('admin'), listDrivers);
router.get('/new', isAuthenticated, authorizeRoles('admin'), renderNewDriver);
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('admin'),
  ensureFields(['name', 'email', 'password', 'licenseNumber', 'vehicleType', 'vehicleNumber', 'availability']),
  createDriver
);
router.post('/:id/assign', isAuthenticated, authorizeRoles('admin'), ensureFields(['rideId']), assignRide);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteDriver);

module.exports = router;
