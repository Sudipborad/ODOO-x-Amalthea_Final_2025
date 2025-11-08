const prisma = require('../config/prisma');

const getDashboardSummary = async (req, res) => {
  try {
    const { companyId } = req.user;

    // Total Employees
    const totalEmployees = await prisma.employee.count({
      where: {
        user: { companyId },
        status: 'ACTIVE'
      }
    });

    // Attendance percentage for current month
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const totalWorkingDays = endOfMonth.getDate();
    const totalAttendanceRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        employee: {
          user: { companyId }
        }
      }
    });
    
    const presentRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PRESENT',
        employee: {
          user: { companyId }
        }
      }
    });

    const attendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
      : 0;

    // Active Leaves (Pending + Approved for current period)
    const activeLeaves = await prisma.timeOff.count({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        fromDate: { lte: new Date() },
        toDate: { gte: new Date() },
        employee: {
          user: { companyId }
        }
      }
    });

    // Payroll Summary for current month
    const payrollSummary = await prisma.payrunLine.aggregate({
      where: {
        payrun: {
          periodStart: { gte: startOfMonth },
          periodEnd: { lte: endOfMonth }
        },
        employee: {
          user: { companyId }
        }
      },
      _sum: {
        gross: true,
        net: true
      },
      _count: {
        id: true
      }
    });

    // Department-wise employee count
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      where: {
        user: { companyId },
        status: 'ACTIVE'
      },
      _count: {
        id: true
      }
    });

    // Monthly salary expense for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySalaryExpense = await prisma.payrunLine.groupBy({
      by: ['payrunId'],
      where: {
        payrun: {
          periodStart: { gte: sixMonthsAgo }
        },
        employee: {
          user: { companyId }
        }
      },
      _sum: {
        net: true
      }
    });

    res.json({
      totalEmployees,
      attendancePercentage,
      activeLeaves,
      payrollSummary: {
        totalGross: payrollSummary._sum.gross || 0,
        totalNet: payrollSummary._sum.net || 0,
        employeeCount: payrollSummary._count.id || 0
      },
      departmentStats: departmentStats.map(dept => ({
        department: dept.department,
        count: dept._count.id
      })),
      monthlySalaryExpense
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDashboardAlerts = async (req, res) => {
  try {
    const { companyId } = req.user;

    // Pending leave requests
    const pendingLeaves = await prisma.timeOff.count({
      where: {
        status: 'PENDING',
        employee: {
          user: { companyId }
        }
      }
    });

    // Employees with incomplete profiles
    const incompleteProfiles = await prisma.employee.count({
      where: {
        user: { 
          companyId,
          isVerified: false 
        }
      }
    });

    // Recent notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    res.json({
      pendingLeaves,
      incompleteProfiles,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardAlerts
};