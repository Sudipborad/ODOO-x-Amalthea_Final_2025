const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDirectProfileUpdate() {
  try {
    // Test updating the employee profile directly with empCode and accountNumber
    const testData = {
      employeeCode: "EMP001",
      bankAccountNumber: "1234567890123",
      panNumber: "ABCDE1234F",
      ifscCode: "SBIN0001234",
    };

    console.log("Testing direct profile update with data:", testData);

    // Update the database directly
    const result = await prisma.employee.update({
      where: { id: 54 },
      data: testData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Direct update successful:", {
      id: result.id,
      employeeCode: result.employeeCode,
      bankAccountNumber: result.bankAccountNumber,
      panNumber: result.panNumber,
      ifscCode: result.ifscCode,
      userName: result.user.name,
    });
  } catch (error) {
    console.error("Direct update error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectProfileUpdate();
