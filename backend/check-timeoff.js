const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTimeOff() {
  console.log('🔍 Checking time-off requests...\n');

  const timeOffRequests = await prisma.timeOff.findMany({
    include: {
      employee: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`Found ${timeOffRequests.length} time-off requests (showing latest 10)`);
  
  if (timeOffRequests.length > 0) {
    timeOffRequests.forEach((request, index) => {
      console.log(`\nRequest ${index + 1}:`);
      console.log(`- ID: ${request.id}`);
      console.log(`- Employee: ${request.employee?.user?.name || 'Unknown'}`);
      console.log(`- Employee ID: ${request.employeeId}`);
      console.log(`- Type: ${request.type}`);
      console.log(`- From: ${request.fromDate}`);
      console.log(`- To: ${request.toDate}`);
      console.log(`- Status: ${request.status}`);
      console.log(`- Reason: ${request.reason}`);
      console.log(`- Created: ${request.createdAt}`);
    });
  }

  // Check users with employee records
  const usersWithEmployees = await prisma.user.findMany({
    include: {
      employee: true
    },
    where: {
      employee: {
        isNot: null
      }
    }
  });

  console.log(`\nUsers with employee records: ${usersWithEmployees.length}`);
  usersWithEmployees.slice(0, 5).forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (User ID: ${user.id}, Employee ID: ${user.employee?.id})`);
  });

  // Check total counts by status
  const statusCounts = await prisma.timeOff.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  console.log('\nTime-off requests by status:');
  statusCounts.forEach(status => {
    console.log(`- ${status.status}: ${status._count.id}`);
  });
}

checkTimeOff()
  .catch(console.error)
  .finally(() => prisma.$disconnect());