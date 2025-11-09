const prisma = require('./src/config/prisma');

async function testDashboardData() {
  try {
    console.log('Testing Dashboard Data...\n');

    // Total Employees
    const totalEmployees = await prisma.employee.count();
    console.log('Total Employees:', totalEmployees);

    // Attendance for current month
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const totalAttendanceRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    
    const presentRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: { in: ['PRESENT', 'LATE'] }
      }
    });

    const attendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
      : 0;

    console.log('Attendance Records This Month:', totalAttendanceRecords);
    console.log('Present Records:', presentRecords);
    console.log('Attendance Percentage:', attendancePercentage);

    // Active Leaves
    const today = new Date();
    const activeLeaves = await prisma.timeOff.count({
      where: {
        status: 'APPROVED',
        fromDate: { lte: today },
        toDate: { gte: today }
      }
    });
    console.log('Active Leaves:', activeLeaves);

    // Payroll Summary
    const latestPayrun = await prisma.payrun.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        payrunLines: true
      }
    });
    
    console.log('Latest Payrun:', latestPayrun ? {
      id: latestPayrun.id,
      totalGross: latestPayrun.totalGross,
      totalNet: latestPayrun.totalNet,
      employeeCount: latestPayrun.payrunLines.length
    } : 'No payrun found');

    // Department Stats
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      _count: {
        id: true
      }
    });
    console.log('Department Stats:', departmentStats);

    // Pending Leaves
    const pendingLeaves = await prisma.timeOff.count({
      where: {
        status: 'PENDING'
      }
    });
    console.log('Pending Leaves:', pendingLeaves);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardData();