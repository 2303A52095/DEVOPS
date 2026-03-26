const express = require('express');
const { renderDashboard } = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, renderDashboard);

module.exports = router;
