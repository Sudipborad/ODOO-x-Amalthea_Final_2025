const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { createEmailToken } = require('../services/token.service');
const { sendInviteEmail } = require('../services/mailer.service');
const { generateUserId } = require('../services/userIdGenerator.service');

const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, temporaryPassword, role = 'EMPLOYEE' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedTempPassword = await bcrypt.hash(temporaryPassword, 12);
    const userId = `TEMP_${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        userId,
        name: email.split('@')[0],
        email,
        role,
        password: hashedTempPassword,
        isVerified: false
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'EMPLOYEE_CREATED',
        details: `Created employee ${email} with temporary credentials`
      }
    });

    res.status(201).json({
      message: 'Employee created. Send credentials to user to complete profile.',
      credentials: {
        email: user.email,
        temporaryPassword,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const inviteEmployee = async (req, res) => {
  try {
    const { email, role = 'EMPLOYEE' } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(temporaryPassword, 12);
    const userId = `TEMP_${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        userId,
        name: email.split('@')[0],
        email,
        role,
        password: hashedTempPassword,
        isVerified: false
      }
    });

    const token = await createEmailToken(prisma, user.id, 'INVITE', 24);
    await sendInviteEmail(user, token);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'EMPLOYEE_INVITED',
        details: `Invited employee ${email} with auto-generated password`
      }
    });

    res.status(201).json({
      message: 'Employee invitation sent. They will receive login credentials via email.',
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            baseSalary: true,
            allowances: true,
            joinDate: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, role },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        isVerified: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'USER_UPDATED',
        details: `Updated user ${user.email}`
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isVerified: true },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        isVerified: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'EMPLOYEE_VERIFIED',
        details: `Verified employee ${user.email}`
      }
    });

    res.json({ message: 'Employee verified successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const inviteValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['ADMIN', 'HR', 'PAYROLL', 'EMPLOYEE']).withMessage('Invalid role')
];

module.exports = {
  createEmployee,
  inviteEmployee,
  getUsers,
  getUser,
  updateUser,
  verifyEmployee,
  createEmployeeValidation: [
    body('email').isEmail().withMessage('Valid email required'),
    body('temporaryPassword').isLength({ min: 6 }).withMessage('Temporary password must be at least 6 characters'),
    body('role').optional().isIn(['ADMIN', 'HR', 'PAYROLL', 'EMPLOYEE']).withMessage('Invalid role')
  ],
  inviteEmployeeValidation: [
    body('email').isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['ADMIN', 'HR', 'PAYROLL', 'EMPLOYEE']).withMessage('Invalid role')
  ]
};