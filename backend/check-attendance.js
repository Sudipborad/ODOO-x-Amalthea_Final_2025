const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAttendance() {
  try {
    const count = await prisma.attendance.count();
    const firstRecord = await prisma.attendance.findFirst({
      orderBy: { date: "asc" },
    });
    const lastRecord = await prisma.attendance.findFirst({
      orderBy: { date: "desc" },
    });

    console.log("Total attendance records:", count);
    console.log("First record date:", firstRecord?.date);
    console.log("Last record date:", lastRecord?.date);

    // Check records for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log("Records for today:", todayCount);

    // Check recent records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
    });

    console.log("Records in last 30 days:", recentCount);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

checkAttendance();
