const prisma = require('./src/config/prisma');

async function checkEmployeeCount() {
  try {
    // Count all employees
    const totalEmployees = await prisma.employee.count();
    console.log('Total employees in database:', totalEmployees);

    // Count all users
    const totalUsers = await prisma.user.count();
    console.log('Total users in database:', totalUsers);

    // Count users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    console.log('Users by role:', usersByRole);

    // Count pending time off requests
    const pendingTimeOff = await prisma.timeOff.count({
      where: { status: 'PENDING' }
    });
    console.log('Pending time off requests:', pendingTimeOff);

    // Get some sample time off requests
    const sampleTimeOff = await prisma.timeOff.findMany({
      take: 5,
      include: {
        employee: {
          include: { user: true }
        }
      }
    });
    console.log('Sample time off requests:', sampleTimeOff.map(t => ({
      id: t.id,
      status: t.status,
      employee: t.employee?.user?.name || 'Unknown'
    })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployeeCount();