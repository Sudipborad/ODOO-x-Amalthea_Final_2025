const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');

const generateCompanyCode = (companyName) => {
  const words = companyName.trim().split(' ');
  if (words.length >= 2) {
    return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
  }
  return companyName.substring(0, 4).toUpperCase();
};

const generateUserId = (firstName, lastName, companyCode, year) => {
  const firstNameCode = firstName.substring(0, 2).toUpperCase();
  const lastNameCode = lastName.substring(0, 2).toUpperCase();
  
  // Get serial number for the year
  const serialNumber = String(Date.now()).slice(-4);
  
  return `${companyCode}${firstNameCode}${lastNameCode}${year}${serialNumber}`;
};

const registerCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, name, email, phone, password } = req.body;

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({ where: { email } });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company already registered with this email' });
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const companyCode = generateCompanyCode(companyName);
    
    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        code: companyCode,
        email,
        phone
      }
    });

    // Create admin user
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    const year = new Date().getFullYear();
    
    const userId = generateUserId(firstName, lastName, companyCode, year);
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userId,
        role: 'ADMIN',
        isVerified: true,
        companyId: company.id
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: 'COMPANY_REGISTERED',
        details: `Company ${companyName} registered with admin ${email}`
      }
    });

    res.status(201).json({
      message: 'Company registered successfully',
      company: {
        id: company.id,
        name: company.name,
        code: company.code
      },
      admin: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const companyRegistrationValidation = [
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Admin name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

module.exports = {
  registerCompany,
  companyRegistrationValidation
};