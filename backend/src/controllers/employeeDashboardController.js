const prisma = require('../config/prisma');

const getEmployeePersonalData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let employee = await prisma.employee.findUnique({
      where: { userId },
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
      // Return default values for users without employee records
      return res.json({
        attendanceCount: 0,
        leaveBalance: 24,
        currentSalary: 0,
        profileCompletion: 20,
        attendanceRate: 0,
        leaveDaysUsed: 0,
        yearsOfService: 0
      });
    }

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

    res.json({
      attendanceCount: presentDays,
      leaveBalance: annualLeave - usedLeave,
      currentSalary: employee.baseSalary,
      profileCompletion,
      attendanceRate: daysInMonth > 0 ? Math.round((presentDays / daysInMonth) * 100) : 0,
      leaveDaysUsed: usedLeave,
      yearsOfService
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEmployeePersonalData
};