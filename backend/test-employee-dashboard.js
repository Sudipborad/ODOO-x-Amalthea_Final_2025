const prisma = require('./src/config/prisma');

async function testEmployeeDashboard() {
  try {
    // Get a sample employee user
    const user = await prisma.user.findFirst({
      where: { role: 'EMPLOYEE' },
      include: { employee: true }
    });
    
    if (!user) {
      console.log('No employee user found');
      return;
    }
    
    console.log('Testing with user:', user.email, 'Employee ID:', user.employee?.id);
    
    // Test the dashboard logic
    let employee = await prisma.employee.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        timeOff: {
          where: {
            status: 'APPROVED',
            fromDate: {
              gte: new Date(new Date().getFullYear(), 0, 1)
            }
          }
        }
      }
    });

    if (!employee) {
      console.log('No employee record found for user');
      return;
    }

    console.log('Employee found:', {
      name: employee.user.name,
      baseSalary: employee.baseSalary,
      joinDate: employee.joinDate,
      attendanceRecords: employee.attendance.length,
      timeOffRecords: employee.timeOff.length
    });

    // Calculate attendance for current month
    const currentMonth = new Date();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const presentDays = employee.attendance.filter(a => a.status === 'PRESENT').length;
    
    // Calculate leave balance (assuming 24 days annual leave)
    const annualLeave = 24;
    const usedLeave = employee.timeOff.reduce((total, leave) => {
      const days = Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

    // Calculate years of service
    const joinDate = new Date(employee.joinDate);
    const yearsOfService = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24 * 365));

    // Calculate profile completion
    const fields = [
      employee.dateOfBirth,
      employee.address,
      employee.gender,
      employee.nationality,
      employee.maritalStatus,
      employee.bankAccountNumber,
      employee.resumePath
    ];
    const completedFields = fields.filter(field => field).length;
    const profileCompletion = Math.round((completedFields / fields.length) * 100);

    const result = {
      attendanceCount: presentDays,
      leaveBalance: annualLeave - usedLeave,
      currentSalary: employee.baseSalary,
      profileCompletion,
      attendanceRate: daysInMonth > 0 ? Math.round((presentDays / daysInMonth) * 100) : 0,
      leaveDaysUsed: usedLeave,
      yearsOfService
    };

    console.log('Dashboard data:', result);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmployeeDashboard();