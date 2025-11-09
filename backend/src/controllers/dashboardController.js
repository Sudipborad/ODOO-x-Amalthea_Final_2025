const prisma = require('../config/prisma');

const getDashboardSummary = async (req, res) => {
  try {
    // Total Employees (excluding admin users)
    const totalEmployees = await prisma.employee.count({
      where: {
        user: {
          role: { in: ['EMPLOYEE', 'HR', 'PAYROLL'] }
        }
      }
    });

    // Attendance percentage for current month
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get working days (excluding weekends)
    const workingDays = [];
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays.push(new Date(d));
      }
    }
    
    const totalExpectedAttendance = totalEmployees * workingDays.length;
    const presentRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: { in: ['PRESENT', 'LATE', 'COMPLETED'] }
      }
    });

    const attendancePercentage = totalExpectedAttendance > 0 
      ? Math.round((presentRecords / totalExpectedAttendance) * 100) 
      : 0;

    // Active Leaves (Approved leaves that are currently active)
    const today = new Date();
    const activeLeaves = await prisma.timeOff.count({
      where: {
        status: 'APPROVED',
        fromDate: { lte: today },
        toDate: { gte: today }
      }
    });

    // Payroll Summary for latest payrun
    const latestPayrun = await prisma.payrun.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        payrunLines: true
      }
    });
    
    const payrollSummary = latestPayrun ? {
      _sum: {
        gross: latestPayrun.totalGross,
        net: latestPayrun.totalNet
      },
      _count: {
        id: latestPayrun.payrunLines.length
      }
    } : {
      _sum: { gross: 0, net: 0 },
      _count: { id: 0 }
    };

    // Department-wise employee count
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      _count: {
        id: true
      }
    });

    // Monthly salary expense for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySalaryExpense = await prisma.payrun.findMany({
      where: {
        periodStart: { gte: sixMonthsAgo },
        status: 'FINALIZED'
      },
      select: {
        totalNet: true,
        periodStart: true
      },
      orderBy: { periodStart: 'desc' }
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
      monthlySalaryExpense: monthlySalaryExpense.map(payrun => ({
        _sum: { net: payrun.totalNet },
        month: payrun.periodStart
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDashboardAlerts = async (req, res) => {
  try {
    // Pending leave requests (only from actual employees, not admins)
    const pendingLeaves = await prisma.timeOff.count({
      where: {
        status: 'PENDING',
        employee: {
          user: {
            role: { in: ['EMPLOYEE', 'HR', 'PAYROLL'] }
          }
        }
      }
    });

    // Employees with incomplete profiles
    const incompleteProfiles = await prisma.user.count({
      where: {
        isVerified: false,
        role: { not: 'ADMIN' }
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