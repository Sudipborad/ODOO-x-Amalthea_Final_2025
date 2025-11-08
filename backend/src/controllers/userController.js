const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { createEmailToken } = require('../services/token.service');
const { sendInviteEmail } = require('../services/mailer.service');

const inviteUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, role = 'EMPLOYEE' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: null,
        isVerified: false
      }
    });

    const token = await createEmailToken(prisma, user.id, 'INVITE', 24);
    await sendInviteEmail(user, token);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'USER_INVITED',
        details: `Invited ${email} as ${role}`
      }
    });

    res.status(201).json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        name: user.name,
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

// Validation middleware
const inviteValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['ADMIN', 'HR', 'PAYROLL', 'EMPLOYEE']).withMessage('Invalid role')
];

module.exports = {
  inviteUser,
  getUsers,
  getUser,
  updateUser,
  inviteValidation
};