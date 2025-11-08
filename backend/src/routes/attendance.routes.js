const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  clockIn,
  clockOut,
  getAttendance,
  getTodayAttendance,
  getAttendanceValidation
} = require('../controllers/attendanceController');

router.post('/clock-in', authenticateToken, requireRole('EMPLOYEE'), clockIn);
router.post('/clock-out', authenticateToken, requireRole('EMPLOYEE'), clockOut);
router.get('/today', authenticateToken, requireRole('EMPLOYEE'), getTodayAttendance);
router.get('/', authenticateToken, getAttendanceValidation, getAttendance);

module.exports = router;