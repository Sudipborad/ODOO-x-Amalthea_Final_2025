const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getDashboardSummary,
  getDashboardAlerts
} = require('../controllers/dashboardController');

router.get('/summary', authenticateToken, getDashboardSummary);
router.get('/alerts', authenticateToken, getDashboardAlerts);

module.exports = router;