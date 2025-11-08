const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  completeProfile,
  updateProfile,
  getProfile,
  completeProfileValidation
} = require('../controllers/profileController');

router.get('/', authenticateToken, getProfile);
router.post('/complete', authenticateToken, completeProfileValidation, completeProfile);
router.put('/update', authenticateToken, updateProfile);

module.exports = router;