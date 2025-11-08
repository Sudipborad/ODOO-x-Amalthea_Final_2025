const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDatabaseData() {
  console.log("🔍 Checking database data...\n");

  try {
    // Check users and employees
    const userCount = await prisma.user.count();
    const employeeCount = await prisma.employee.count();
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏢 Employees: ${employeeCount}`);

    // Check attendance
    const attendanceCount = await prisma.attendance.count();
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });
    console.log(`📅 Total Attendance Records: ${attendanceCount}`);
    console.log(`📅 Today's Attendance Records: ${todayAttendance}`);

    // Check payroll data
    const payrunCount = await prisma.payrun.count();
    const payslipCount = await prisma.payslip.count();
    console.log(`💰 Payrun Records: ${payrunCount}`);
    console.log(`📄 Payslip Records: ${payslipCount}`);

    // Check time-off requests
    const timeoffCount = await prisma.timeOff.count();
    console.log(`🏖️ Time-off Requests: ${timeoffCount}`);

    // Check skills and certifications
    const skillCount = await prisma.skill.count();
    const certificationCount = await prisma.certification.count();
    console.log(`🛠️ Skills: ${skillCount}`);
    console.log(`🏆 Certifications: ${certificationCount}`);

    // Check notifications
    const notificationCount = await prisma.notification.count();
    console.log(`🔔 Notifications: ${notificationCount}`);

    // Check departments
    const departmentCount = await prisma.department.count();
    console.log(`🏬 Departments: ${departmentCount}`);

    console.log("\n✅ Database check completed!");
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

checkDatabaseData().finally(async () => {
  await prisma.$disconnect();
});
