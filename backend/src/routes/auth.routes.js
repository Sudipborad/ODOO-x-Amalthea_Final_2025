const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  acceptInvite,
  setPassword,
  registerValidation,
  loginValidation
} = require('../controllers/authController');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/accept-invite', acceptInvite);
router.post('/set-password', setPassword);

module.exports = router;