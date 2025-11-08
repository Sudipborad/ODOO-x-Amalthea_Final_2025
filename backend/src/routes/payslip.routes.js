const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getPayslips,
  getPayslip,
  downloadPayslip,
  regeneratePayslip
} = require('../controllers/payslipController');

router.get('/', authenticateToken, getPayslips);
router.get('/:id', authenticateToken, getPayslip);
router.get('/:id/download', authenticateToken, downloadPayslip);
router.post('/:id/regenerate', authenticateToken, requireRole('ADMIN', 'PAYROLL'), regeneratePayslip);

module.exports = router;