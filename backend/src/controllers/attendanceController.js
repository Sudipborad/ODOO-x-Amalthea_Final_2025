const { query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { formatDate } = require('../utils/dateUtils');

const clockIn = async (req, res) => {
  try {
    const { employeeId } = req.user;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee record not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already clocked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    const checkInTime = new Date();
    
    const attendance = existingAttendance 
      ? await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkIn: checkInTime,
            status: 'PRESENT'
          }
        })
      : await prisma.attendance.create({
          data: {
            employeeId,
            date: today,
            checkIn: checkInTime,
            status: 'PRESENT'
          }
        });

    res.json({
      message: 'Clocked in successfully',
      attendance: {
        id: attendance.id,
        checkIn: attendance.checkIn,
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clockOut = async (req, res) => {
  try {
    const { employeeId } = req.user;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee record not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: 'No clock-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ error: 'Already clocked out today' });
    }

    const checkOutTime = new Date();
    const totalHours = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60);

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100
      }
    });

    res.json({
      message: 'Clocked out successfully',
      attendance: {
        id: updatedAttendance.id,
        checkIn: updatedAttendance.checkIn,
        checkOut: updatedAttendance.checkOut,
        totalHours: updatedAttendance.totalHours,
        status: updatedAttendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, from, to, page = 1, limit = 10 } = req.query;
    const { role, employeeId: userEmployeeId } = req.user;
    
    // Check permissions
    const canViewAll = ['ADMIN', 'HR', 'PAYROLL'].includes(role);
    const targetEmployeeId = employeeId ? parseInt(employeeId) : userEmployeeId;
    
    if (!canViewAll && targetEmployeeId !== userEmployeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (page - 1) * limit;
    const whereClause = {
      employeeId: targetEmployeeId
    };

    if (from || to) {
      whereClause.date = {};
      if (from) whereClause.date.gte = new Date(from);
      if (to) whereClause.date.lte = new Date(to);
    }

    const attendance = await prisma.attendance.findMany({
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
      orderBy: { date: 'desc' }
    });

    const total = await prisma.attendance.count({ where: whereClause });

    res.json({
      attendance,
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

const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.user;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee record not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({
      attendance: attendance || null,
      canClockIn: !attendance || !attendance.checkIn,
      canClockOut: attendance && attendance.checkIn && !attendance.checkOut
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const getAttendanceValidation = [
  query('employeeId').optional().isInt().withMessage('Valid employee ID required'),
  query('from').optional().isISO8601().withMessage('Valid from date required'),
  query('to').optional().isISO8601().withMessage('Valid to date required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Valid page number required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Valid limit required')
];

module.exports = {
  clockIn,
  clockOut,
  getAttendance,
  getTodayAttendance,
  getAttendanceValidation
};