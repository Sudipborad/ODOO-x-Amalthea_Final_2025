const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createEmployeeForUser() {
  try {
    // Get the user sudipborad1
    const user = await prisma.user.findUnique({
      where: { email: "sudipborad1@example.com" },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Found user:", user);

    // Check if employee record already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (existingEmployee) {
      console.log("Employee record already exists:", existingEmployee);
      return;
    }

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        department: "Technology",
        designation: "Software Developer",
        baseSalary: 75000,
        allowances: 5000,
        joinDate: new Date("2024-01-15"),
        // Add some sample data for the enhanced fields
        dateOfBirth: new Date("1995-03-15"),
        gender: "Male",
        nationality: "Indian",
        maritalStatus: "Single",
        address: "123 Tech Park, Bangalore, Karnataka, India",
        phoneNumber: "+91-9876543210",
        workLocation: "Bangalore Office",
        employmentType: "Full-time",
        workShift: "Day",
        probationPeriod: 6,
        noticePeriod: 30,
        skills: ["JavaScript", "React", "Node.js", "Python"],
        certifications: ["AWS Certified Developer", "React Certification"],
        bloodGroup: "O+",
      },
    });

    console.log("Created employee record:", employee);
  } catch (error) {
    console.error("Error creating employee:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployeeForUser();
