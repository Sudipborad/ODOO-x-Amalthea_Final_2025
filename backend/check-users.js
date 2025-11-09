const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        employee: true,
      },
    });

    console.log("Users in database:");
    users.forEach((user) => {
      console.log(
        `- ID: ${user.id}, Email: ${user.email}, Name: ${
          user.name
        }, Has Employee: ${!!user.employee}`
      );
      if (user.employee) {
        console.log(
          `  Employee ID: ${user.employee.id}, Department: ${user.employee.department}, Designation: ${user.employee.designation}`
        );
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

checkUsers();
