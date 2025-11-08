const { body, query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { sendTimeOffNotification } = require('../services/mailer.service');

const createTimeOffRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId } = req.user;
    const { fromDate, toDate, type, reason } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee record not found' });
    }

    // Validate date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from >= to) {
      return res.status(400).json({ error: 'From date must be before to date' });
    }

    if (from < new Date()) {
      return res.status(400).json({ error: 'Cannot request leave for past dates' });
    }

    const timeOff = await prisma.timeOff.create({
      data: {
        employeeId,
        fromDate: from,
        toDate: to,
        type,
        reason,
        status: 'PENDING'
      },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'TIMEOFF_CREATED',
        details: `Created time off request from ${fromDate} to ${toDate}`
      }
    });

    // Notify HR/Payroll users
    const hrUsers = await prisma.user.findMany({
      where: {
        role: { in: ['HR', 'PAYROLL', 'ADMIN'] },
        isVerified: true
      }
    });

    for (const hrUser of hrUsers) {
      try {
        await sendTimeOffNotification(timeOff.employee, timeOff, 'request');
      } catch (emailError) {
        console.error('Failed to send notification:', emailError);
      }
    }

    res.status(201).json(timeOff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTimeOffRequests = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, employeeId, page = 1, limit = 10 } = req.query;
    const { role, employeeId: userEmployeeId } = req.user;
    
    const skip = (page - 1) * limit;
    const whereClause = {};

    // Role-based filtering
    if (role === 'EMPLOYEE') {
      if (!userEmployeeId) {
        return res.status(400).json({ error: 'Employee record not found. Please complete your profile first.' });
      }
      whereClause.employeeId = userEmployeeId;
    } else if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    }

    if (status) {
      whereClause.status = status;
    }

    const timeOffRequests = await prisma.timeOff.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.timeOff.count({ where: whereClause });

    res.json({
      timeOffRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveTimeOff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timeOff = await prisma.timeOff.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    if (!timeOff) {
      return res.status(404).json({ error: 'Time off request not found' });
    }

    if (timeOff.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    const updatedTimeOff = await prisma.timeOff.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVED',
        approverId: req.user.id
      },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'TIMEOFF_APPROVED',
        details: `Approved time off request for ${timeOff.employee.user.name}`
      }
    });

    // Send notification to employee
    try {
      await sendTimeOffNotification(updatedTimeOff.employee, updatedTimeOff, 'approval');
    } catch (emailError) {
      console.error('Failed to send notification:', emailError);
    }

    res.json(updatedTimeOff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectTimeOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const timeOff = await prisma.timeOff.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    if (!timeOff) {
      return res.status(404).json({ error: 'Time off request not found' });
    }

    if (timeOff.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    const updatedTimeOff = await prisma.timeOff.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        approverId: req.user.id,
        reason: reason ? `${timeOff.reason} | Rejection reason: ${reason}` : timeOff.reason
      },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'TIMEOFF_REJECTED',
        details: `Rejected time off request for ${timeOff.employee.user.name}`
      }
    });

    // Send notification to employee
    try {
      await sendTimeOffNotification(updatedTimeOff.employee, updatedTimeOff, 'rejection');
    } catch (emailError) {
      console.error('Failed to send notification:', emailError);
    }

    res.json(updatedTimeOff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const createTimeOffValidation = [
  body('fromDate').isISO8601().withMessage('Valid from date required'),
  body('toDate').isISO8601().withMessage('Valid to date required'),
  body('type').isIn(['SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'MATERNITY', 'PATERNITY']).withMessage('Valid leave type required'),
  body('reason').trim().isLength({ min: 5 }).withMessage('Reason must be at least 5 characters')
];

const getTimeOffValidation = [
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Valid status required'),
  query('employeeId').optional().isInt().withMessage('Valid employee ID required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Valid page number required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Valid limit required')
];

module.exports = {
  createTimeOffRequest,
  getTimeOffRequests,
  approveTimeOff,
  rejectTimeOff,
  createTimeOffValidation,
  getTimeOffValidation
};