const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createEmployeeForSudipborad1() {
  try {
    console.log("Creating employee record for sudipborad1...");

    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: "sudipborad1@gmail.com" },
    });

    if (!user) {
      console.log("User sudipborad1@gmail.com not found");
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

    // Create employee record with sample data for all tabs
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: `EMP${String(user.id).padStart(3, "0")}`,
        department: "Information Technology",
        designation: "Software Developer",
        baseSalary: 75000.0,
        allowances: 5000.0,
        joinDate: new Date("2024-01-15"),
        status: "ACTIVE",

        // Private Info Tab
        dateOfBirth: new Date("1995-06-15"),
        address: "123 Tech Street, Bangalore",
        permanentAddress: "456 Home Street, Mumbai",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001",
        country: "India",
        gender: "Male",
        nationality: "Indian",
        maritalStatus: "Single",
        phone: "+91-9876543210",
        personalEmail: "sudipborad1.personal@gmail.com",

        // Emergency Contact
        emergencyContactName: "John Borad",
        emergencyContactPhone: "+91-9876543211",
        emergencyContactRelation: "Father",
        emergencyContactAddress: "456 Home Street, Mumbai",

        // Security Tab - Government IDs
        aadharNumber: "1234-5678-9012",
        panNumber: "ABCDE1234F",
        passportNumber: "A1234567",
        drivingLicenseNumber: "DL123456789",

        // Salary Info Tab - Bank Details
        bankAccountNumber: "1234567890123456",
        bankName: "State Bank of India",
        bankBranch: "Bangalore Main Branch",
        ifscCode: "SBIN0001234",
        accountHolderName: "Sudip Borad",
        accountType: "SAVINGS",

        // Additional Financial Info
        pfNumber: "PF123456789",
        uanNumber: "UAN123456789012",
        esiNumber: "ESI1234567890",

        // Professional Info
        workLocation: "Bangalore Office",
        workType: "FULL_TIME",
        probationPeriod: 3,
        confirmationDate: new Date("2024-04-15"),
        totalExperience: 2.5,

        // Health Info
        bloodGroup: "B+",
        medicalConditions: "None",
        insuranceNominee: "John Borad",
        insuranceNomineeRelation: "Father",
      },
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

    console.log("Successfully created employee record:");
    console.log({
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.user.name,
      email: employee.user.email,
      department: employee.department,
      designation: employee.designation,
      joinDate: employee.joinDate,
      status: employee.status,
    });

    // Create some sample skills
    await prisma.skill.createMany({
      data: [
        {
          employeeId: employee.id,
          name: "JavaScript",
          proficiency: "Advanced",
        },
        {
          employeeId: employee.id,
          name: "React",
          proficiency: "Intermediate",
        },
        {
          employeeId: employee.id,
          name: "Node.js",
          proficiency: "Intermediate",
        },
      ],
    });

    // Create some sample certifications
    await prisma.certification.createMany({
      data: [
        {
          employeeId: employee.id,
          name: "AWS Cloud Practitioner",
          issueDate: new Date("2023-06-01"),
          validityDate: new Date("2026-06-01"),
        },
        {
          employeeId: employee.id,
          name: "React Developer Certification",
          issueDate: new Date("2023-03-15"),
          validityDate: new Date("2025-03-15"),
        },
      ],
    });

    console.log("Added sample skills and certifications");
    console.log(
      "Employee profile is now complete and ready for tabbed interface!"
    );
  } catch (error) {
    console.error("Error creating employee record:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployeeForSudipborad1();
