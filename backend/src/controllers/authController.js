const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { createEmailToken, validateToken, markTokenUsed } = require('../services/token.service');
const { sendVerificationEmail, sendInviteEmail, sendPasswordResetEmail } = require('../services/mailer.service');

const generateJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = await createEmailToken(prisma, user.id, 'VERIFY', 24);
    await sendVerificationEmail(user, token);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: 'USER_REGISTERED',
        details: `User ${email} registered`
      }
    });

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for verification.' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { employee: true }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateJWT(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: user.employee
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const token = await createEmailToken(prisma, user.id, 'RESET', 1);
      await sendPasswordResetEmail(user, token);
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: 'PASSWORD_RESET_REQUESTED',
          details: `Password reset requested for ${email}`
        }
      });
    }

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const emailToken = await validateToken(prisma, token, 'RESET');
    if (!emailToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: emailToken.userId },
      data: { 
        password: hashedPassword,
        isVerified: true
      }
    });

    await markTokenUsed(prisma, emailToken.id);

    await prisma.auditLog.create({
      data: {
        userId: emailToken.userId,
        role: emailToken.user.role,
        action: 'PASSWORD_RESET_COMPLETED',
        details: `Password reset completed for ${emailToken.user.email}`
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const emailToken = await validateToken(prisma, token, 'INVITE');
    if (!emailToken) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    res.json({
      user: {
        name: emailToken.user.name,
        email: emailToken.user.email,
        role: emailToken.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const emailToken = await validateToken(prisma, token, 'INVITE');
    if (!emailToken) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    await prisma.user.update({
      where: { id: emailToken.userId },
      data: { 
        password: hashedPassword,
        isVerified: true
      }
    });

    await markTokenUsed(prisma, emailToken.id);

    await prisma.auditLog.create({
      data: {
        userId: emailToken.userId,
        role: emailToken.user.role,
        action: 'INVITATION_ACCEPTED',
        details: `User ${emailToken.user.email} accepted invitation`
      }
    });

    res.json({ message: 'Password set successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  acceptInvite,
  setPassword,
  registerValidation,
  loginValidation
};