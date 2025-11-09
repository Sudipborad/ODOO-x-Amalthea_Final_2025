const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixSudipBoradSalary() {
  try {
    console.log("Fixing sudipborad1 salary...");

    const updated = await prisma.employee.updateMany({
      where: {
        user: {
          email: "sudipborad1@gmail.com",
        },
      },
      data: {
        baseSalary: 75000.0, // Fix the decimal issue
      },
    });

    console.log(`Updated ${updated.count} employee records`);
  } catch (error) {
    console.error("Error fixing salary:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSudipBoradSalary();
