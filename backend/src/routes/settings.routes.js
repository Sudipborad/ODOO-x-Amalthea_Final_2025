const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getCompanySettings,
  updateCompanyInfo,
  addDepartment,
  deleteDepartment,
  getSystemSettings
} = require('../controllers/settingsController');

// Company settings (Admin only)
router.get('/company', authenticateToken, requireRole(['ADMIN']), getCompanySettings);
router.put('/company', authenticateToken, requireRole(['ADMIN']), updateCompanyInfo);

// Department management (Admin only)
router.post('/departments', authenticateToken, requireRole(['ADMIN']), addDepartment);
router.delete('/departments/:id', authenticateToken, requireRole(['ADMIN']), deleteDepartment);

// System settings (Admin only)
router.get('/system', authenticateToken, requireRole(['ADMIN']), getSystemSettings);

module.exports = router;