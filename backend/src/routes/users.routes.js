const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  inviteUser,
  getUsers,
  getUser,
  updateUser,
  inviteValidation
} = require('../controllers/userController');

router.post('/invite', authenticateToken, requireRole('ADMIN'), inviteValidation, inviteUser);
router.get('/', authenticateToken, requireRole('ADMIN', 'HR'), getUsers);
router.get('/:id', authenticateToken, requireRole('ADMIN', 'HR'), getUser);
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateUser);

module.exports = router;