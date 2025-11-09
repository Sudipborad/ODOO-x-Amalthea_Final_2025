const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    console.log("Checking employees in database...");

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`Found ${employees.length} employees:`);

    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.user.name} (${emp.user.email})`);
      console.log(`   - Department: ${emp.department}`);
      console.log(`   - Designation: ${emp.designation}`);
      console.log(`   - Base Salary: ${emp.baseSalary}`);
      console.log(`   - Join Date: ${emp.joinDate}`);
      console.log(`   - Status: ${emp.status}`);
      console.log("");
    });

    if (employees.length === 0) {
      console.log("❌ No employees found in database!");
      console.log('This explains why payroll shows "Unknown Employee"');
    } else {
      console.log(
        "✅ Employees found! The issue might be in the payroll computation logic."
      );
    }
  } catch (error) {
    console.error("Error checking employees:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
