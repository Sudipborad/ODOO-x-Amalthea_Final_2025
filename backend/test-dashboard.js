const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboardData() {
  console.log('🔍 Testing dashboard data...\n');

  // Total Employees
  const totalEmployees = await prisma.employee.count({
    where: { status: 'ACTIVE' }
  });
  console.log(`Total Active Employees: ${totalEmployees}`);

  // Attendance for current month
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const totalAttendanceRecords = await prisma.attendance.count({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth }
    }
  });
  
  const presentRecords = await prisma.attendance.count({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
      status: { in: ['PRESENT', 'LATE'] }
    }
  });

  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
    : 0;

  console.log(`Attendance Records: ${totalAttendanceRecords}`);
  console.log(`Present Records: ${presentRecords}`);
  console.log(`Attendance Percentage: ${attendancePercentage}%`);

  // Active Leaves
  const today = new Date();
  const activeLeaves = await prisma.timeOff.count({
    where: {
      status: 'APPROVED',
      fromDate: { lte: today },
      toDate: { gte: today }
    }
  });
  console.log(`Active Leaves: ${activeLeaves}`);

  // Latest Payroll
  const latestPayrun = await prisma.payrun.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { payrunLines: true }
  });

  if (latestPayrun) {
    console.log(`Latest Payrun: ${latestPayrun.totalGross} gross, ${latestPayrun.totalNet} net, ${latestPayrun.payrunLines.length} employees`);
  }

  // Department Stats
  const departmentStats = await prisma.employee.groupBy({
    by: ['department'],
    where: { status: 'ACTIVE' },
    _count: { id: true }
  });

  console.log('\nDepartment Stats:');
  departmentStats.forEach(dept => {
    console.log(`- ${dept.department}: ${dept._count.id} employees`);
  });

  // Pending leaves
  const pendingLeaves = await prisma.timeOff.count({
    where: { status: 'PENDING' }
  });
  console.log(`\nPending Leaves: ${pendingLeaves}`);

  // Incomplete profiles
  const incompleteProfiles = await prisma.user.count({
    where: {
      isVerified: false,
      role: { not: 'ADMIN' }
    }
  });
  console.log(`Incomplete Profiles: ${incompleteProfiles}`);
}

testDashboardData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());