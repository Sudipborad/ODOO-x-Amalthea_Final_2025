const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testProfileUpdate() {
  try {
    // Check what employee profile data we have
    const employee = await prisma.employee.findFirst({
      where: { id: 54 },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      console.log("Employee with ID 54 not found");
      return;
    }

    console.log("Current employee data:");
    console.log(JSON.stringify(employee, null, 2));

    // Check if IFSC code exists and its format
    if (employee.ifscCode) {
      console.log("\nCurrent IFSC code:", employee.ifscCode);
      console.log("IFSC code length:", employee.ifscCode.length);
      console.log("IFSC code type:", typeof employee.ifscCode);

      const ifscPattern = /^[A-Z]{4}[0-9A-Z]{7}$/i;
      console.log("Matches pattern:", ifscPattern.test(employee.ifscCode));
    } else {
      console.log("\nNo IFSC code found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testProfileUpdate();
