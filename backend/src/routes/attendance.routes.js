const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const {
  clockIn,
  clockOut,
  getAttendance,
  getTodayAttendance,
  getAttendanceValidation
} = require('../controllers/attendanceController');

router.post('/clock-in', authenticateToken, clockIn);
router.post('/clock-out', authenticateToken, clockOut);
router.get('/today', authenticateToken, getTodayAttendance);
router.get('/', authenticateToken, getAttendanceValidation, getAttendance);

module.exports = router;