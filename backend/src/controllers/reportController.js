const { query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');

const getPayrollReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { month, year = new Date().getFullYear() } = req.query;
    
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payruns = await prisma.payrun.findMany({
      where: {
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
        status: 'FINALIZED'
      },
      include: {
        payrunLines: {
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
          }
        }
      }
    });

    const summary = {
      totalPayruns: payruns.length,
      totalEmployees: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      departmentWise: {},
      payrunDetails: []
    };

    payruns.forEach(payrun => {
      const payrunSummary = {
        id: payrun.id,
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
        employeeCount: payrun.payrunLines.length,
        totalGross: payrun.totalGross,
        totalDeductions: payrun.totalDeductions,
        totalNet: payrun.totalNet
      };

      summary.payrunDetails.push(payrunSummary);
      summary.totalEmployees += payrun.payrunLines.length;
      summary.totalGross += payrun.totalGross;
      summary.totalDeductions += payrun.totalDeductions;
      summary.totalNet += payrun.totalNet;

      // Department-wise breakdown
      payrun.payrunLines.forEach(line => {
        const dept = line.employee.department;
        if (!summary.departmentWise[dept]) {
          summary.departmentWise[dept] = {
            employeeCount: 0,
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0
          };
        }
        
        summary.departmentWise[dept].employeeCount += 1;
        summary.departmentWise[dept].totalGross += line.gross;
        summary.departmentWise[dept].totalDeductions += 
          line.unpaidDeduction + line.pfEmployee + line.professionalTax + line.otherDeductions;
        summary.departmentWise[dept].totalNet += line.net;
      });
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to, department, employeeId } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'From and to dates are required' });
    }

    const whereClause = {
      date: {
        gte: new Date(from),
        lte: new Date(to)
      }
    };

    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    }

    if (department) {
      whereClause.employee = {
        department
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
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
      orderBy: [
        { employee: { department: 'asc' } },
        { employee: { user: { name: 'asc' } } },
        { date: 'asc' }
      ]
    });

    // Group by employee
    const employeeAttendance = {};
    
    attendance.forEach(record => {
      const empId = record.employeeId;
      if (!employeeAttendance[empId]) {
        employeeAttendance[empId] = {
          employee: record.employee,
          records: [],
          summary: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            totalHours: 0,
            avgHoursPerDay: 0
          }
        };
      }
      
      employeeAttendance[empId].records.push(record);
      employeeAttendance[empId].summary.totalDays += 1;
      
      if (record.status === 'PRESENT') {
        employeeAttendance[empId].summary.presentDays += 1;
        if (record.totalHours) {
          employeeAttendance[empId].summary.totalHours += record.totalHours;
        }
      } else {
        employeeAttendance[empId].summary.absentDays += 1;
      }
    });

    // Calculate averages
    Object.values(employeeAttendance).forEach(emp => {
      if (emp.summary.presentDays > 0) {
        emp.summary.avgHoursPerDay = 
          Math.round((emp.summary.totalHours / emp.summary.presentDays) * 100) / 100;
      }
    });

    // Overall summary
    const overallSummary = {
      totalEmployees: Object.keys(employeeAttendance).length,
      totalRecords: attendance.length,
      presentRecords: attendance.filter(r => r.status === 'PRESENT').length,
      absentRecords: attendance.filter(r => r.status === 'ABSENT').length,
      avgAttendanceRate: 0
    };

    if (overallSummary.totalRecords > 0) {
      overallSummary.avgAttendanceRate = 
        Math.round((overallSummary.presentRecords / overallSummary.totalRecords) * 10000) / 100;
    }

    res.json({
      summary: overallSummary,
      employeeAttendance: Object.values(employeeAttendance)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {};
    if (action) {
      whereClause.action = { contains: action, mode: 'insensitive' };
    }
    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' }
    });

    const total = await prisma.auditLog.count({ where: whereClause });

    res.json({
      auditLogs,
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

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Employee stats
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({
      where: {
        user: { isVerified: true }
      }
    });

    // Attendance stats for current month
    const attendanceThisMonth = await prisma.attendance.count({
      where: {
        date: { gte: startOfMonth },
        status: 'PRESENT'
      }
    });

    const totalAttendanceRecords = await prisma.attendance.count({
      where: {
        date: { gte: startOfMonth }
      }
    });

    const attendanceRate = totalAttendanceRecords > 0 ? 
      Math.round((attendanceThisMonth / totalAttendanceRecords) * 100) : 0;

    // Pending time-off requests
    const pendingTimeOff = await prisma.timeOff.count({
      where: { status: 'PENDING' }
    });

    // Payroll stats for current year
    const payrollThisYear = await prisma.payrun.aggregate({
      where: {
        createdAt: { gte: startOfYear },
        status: 'FINALIZED'
      },
      _sum: {
        totalNet: true
      },
      _count: {
        id: true
      }
    });

    // Recent activities
    const recentActivities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        action: true,
        details: true,
        timestamp: true,
        role: true
      }
    });

    res.json({
      employees: {
        total: totalEmployees,
        active: activeEmployees
      },
      attendance: {
        rate: attendanceRate,
        presentThisMonth: attendanceThisMonth,
        totalRecordsThisMonth: totalAttendanceRecords
      },
      timeOff: {
        pending: pendingTimeOff
      },
      payroll: {
        totalPayrunsThisYear: payrollThisYear._count.id || 0,
        totalPayoutThisYear: payrollThisYear._sum.totalNet || 0
      },
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const payrollReportValidation = [
  query('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) required'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Valid year required')
];

const attendanceReportValidation = [
  query('from').isISO8601().withMessage('Valid from date required'),
  query('to').isISO8601().withMessage('Valid to date required'),
  query('employeeId').optional().isInt().withMessage('Valid employee ID required')
];

module.exports = {
  getPayrollReport,
  getAttendanceReport,
  getAuditLogs,
  getDashboardStats,
  payrollReportValidation,
  attendanceReportValidation
};