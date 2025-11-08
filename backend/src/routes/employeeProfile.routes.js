const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getEmployeeProfile,
  updatePersonalInfo,
  updateBankDetails,
  uploadResume,
  addSkill,
  removeSkill,
  addCertification,
  removeCertification,
  getSalaryInfo
} = require('../controllers/employeeProfileController');

// Get employee profile
router.get('/:id', authenticateToken, getEmployeeProfile);

// Update personal information
router.put('/:id/personal', authenticateToken, updatePersonalInfo);

// Update bank details - employees can update their own, admins/HR can update any
router.put('/:id/bank', authenticateToken, updateBankDetails);

// Upload resume
router.post('/:id/resume', authenticateToken, uploadResume);

// Skills management
router.post('/:id/skills', authenticateToken, addSkill);
router.delete('/skills/:skillId', authenticateToken, removeSkill);

// Certifications management
router.post('/:id/certifications', authenticateToken, addCertification);
router.delete('/certifications/:certId', authenticateToken, removeCertification);

// Salary information
router.get('/:id/salary', authenticateToken, getSalaryInfo);

module.exports = router;