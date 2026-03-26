const express = require('express');
const {
  listRides,
  renderCreateRide,
  createRide,
  viewRide,
  renderEditRide,
  updateRide,
  cancelRide,
  deleteRide
} = require('../controllers/rideController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { ensureFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, listRides);
router.get('/new', isAuthenticated, renderCreateRide);
router.post('/', isAuthenticated, ensureFields(['pickupLocation', 'dropLocation', 'rideType', 'rideDate']), createRide);
router.get('/:id', isAuthenticated, viewRide);
router.get('/:id/edit', isAuthenticated, renderEditRide);
router.put('/:id', isAuthenticated, ensureFields(['pickupLocation', 'dropLocation', 'rideType', 'rideDate', 'status']), updateRide);
router.patch('/:id/cancel', isAuthenticated, cancelRide);
router.delete('/:id', isAuthenticated, deleteRide);

module.exports = router;
