const { query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { formatDate } = require('../utils/dateUtils');

const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find or create employee record
    let employee = await prisma.employee.findUnique({
      where: { userId }
    });
    
    if (!employee) {
      // Create basic employee record for users without one
      employee = await prisma.employee.create({
        data: {
          userId,
          employeeCode: `EMP${userId}`,
          department: 'General',
          designation: 'Employee',
          baseSalary: 0,
          joinDate: new Date()
        }
      });
    }
    
    const employeeId = employee.id;

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
    const userId = req.user.id;
    
    const employee = await prisma.employee.findUnique({
      where: { userId }
    });
    
    if (!employee) {
      return res.status(400).json({ error: 'Employee record not found' });
    }
    
    const employeeId = employee.id;

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
    const roundedHours = Math.round(totalHours * 100) / 100;

    // Determine status based on hours worked
    // If less than 4 hours (and more than 0), mark as HALF_DAY, otherwise COMPLETED
    // If 0 hours, still mark as COMPLETED since they clocked out
    const status = (roundedHours > 0 && roundedHours < 4) ? 'HALF_DAY' : 'COMPLETED';

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        totalHours: roundedHours,
        status: status
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
    
    const skip = (page - 1) * limit;
    const whereClause = {};
    
    if (!canViewAll) {
      // Regular employees can only see their own attendance
      whereClause.employeeId = userEmployeeId;
    } else if (employeeId) {
      // Admin/HR can filter by specific employee
      whereClause.employeeId = parseInt(employeeId);
    }
    // If admin/HR and no employeeId specified, show all employees

    if (from || to) {
      whereClause.date = {};
      if (from) {
        // Handle date-only format (YYYY-MM-DD) - set to start of day
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        whereClause.date.gte = fromDate;
      }
      if (to) {
        // Handle date-only format (YYYY-MM-DD) - set to end of day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        whereClause.date.lte = toDate;
      }
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

    // Update status for records that have checkOut but status is still PRESENT
    // This handles existing records created before the status update logic
    // Also calculate status on-the-fly to ensure correct display
    const updatedAttendance = await Promise.all(
      attendance.map(async (record) => {
        // If record has checkOut, calculate correct status
        if (record.checkOut) {
          const totalHours = record.totalHours || 0;
          // If 0 hours or >= 4 hours, mark as COMPLETED
          // If between 0 and 4 hours, mark as HALF_DAY
          const calculatedStatus = (totalHours > 0 && totalHours < 4) ? 'HALF_DAY' : 'COMPLETED';
          
          // If status is still PRESENT, update it in database
          if (record.status === 'PRESENT') {
            await prisma.attendance.update({
              where: { id: record.id },
              data: { status: calculatedStatus }
            });
          }
          
          // Return record with correct status
          return {
            ...record,
            status: calculatedStatus
          };
        }
        return record;
      })
    );

    const total = await prisma.attendance.count({ where: whereClause });

    res.json({
      attendance: updatedAttendance,
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
    const userId = req.user.id;
    
    const employee = await prisma.employee.findUnique({
      where: { userId }
    });
    
    if (!employee) {
      return res.json({
        attendance: null,
        canClockIn: true,
        canClockOut: false
      });
    }
    
    const employeeId = employee.id;

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
  query('from').optional().custom((value) => {
    // Accept both date-only format (YYYY-MM-DD) and ISO8601 format
    if (!value) return true;
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateOnlyRegex.test(value) || iso8601Regex.test(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }).withMessage('Valid from date required (YYYY-MM-DD or ISO8601)'),
  query('to').optional().custom((value) => {
    // Accept both date-only format (YYYY-MM-DD) and ISO8601 format
    if (!value) return true;
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateOnlyRegex.test(value) || iso8601Regex.test(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }).withMessage('Valid to date required (YYYY-MM-DD or ISO8601)'),
  query('page').optional().isInt({ min: 1 }).withMessage('Valid page number required'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Valid limit required (1-10000)')
];

module.exports = {
  clockIn,
  clockOut,
  getAttendance,
  getTodayAttendance,
  getAttendanceValidation
};