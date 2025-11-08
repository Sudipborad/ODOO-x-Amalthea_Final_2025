const express = require('express');
const router = express.Router();
const {
  registerCompany,
  companyRegistrationValidation
} = require('../controllers/companyController');

router.post('/register', companyRegistrationValidation, registerCompany);

module.exports = router;