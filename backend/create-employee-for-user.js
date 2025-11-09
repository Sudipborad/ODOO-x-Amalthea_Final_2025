const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createEmployeeForUser() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: "sudipborad1@gmail.com" },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Found user:", user.name, user.email);

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (existingEmployee) {
      console.log("Employee record already exists");
      return;
    }

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        department: "Information Technology",
        designation: "Software Developer",
        joinDate: new Date("2024-01-15"),
        baseSalary: 60000,
        allowances: 5000,
        // Add some sample data for the new fields
        dateOfBirth: new Date("1995-03-20"),
        gender: "Male",
        nationality: "Indian",
        maritalStatus: "Single",
        address: "Sample Address, City, State",
        phoneNumber: "+91-9876543210",
        emergencyContactName: "Emergency Contact",
        emergencyContactPhone: "+91-9876543211",
        emergencyContactRelation: "Father",
        workLocation: "Gandhinagar Office",
        employmentType: "Full-time",
        workShift: "Day",
        probationPeriod: 6,
        noticePeriod: 30,
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        certifications: ["AWS Certified Developer"],
        bloodGroup: "B+",
        medicalConditions: "None",
      },
    });

    console.log("Created employee record:", employee.id);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

createEmployeeForUser();
