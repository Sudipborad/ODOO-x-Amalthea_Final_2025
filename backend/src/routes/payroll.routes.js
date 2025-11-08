const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  computePayrollDraft,
  finalizePayrollRun,
  getPayruns,
  getPayrun,
  deletePayrun,
  computePayrollValidation,
  finalizePayrollValidation
} = require('../controllers/payrollController');

router.post('/compute', authenticateToken, requireRole('PAYROLL', 'ADMIN'), computePayrollValidation, computePayrollDraft);
router.post('/finalize', authenticateToken, requireRole('ADMIN'), finalizePayrollValidation, finalizePayrollRun);
router.get('/', authenticateToken, requireRole('ADMIN', 'PAYROLL'), getPayruns);
router.get('/:id', authenticateToken, requireRole('ADMIN', 'PAYROLL'), getPayrun);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deletePayrun);

module.exports = router;