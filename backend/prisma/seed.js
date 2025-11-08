const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { generateUserId } = require("../src/services/userIdGenerator.service");

const prisma = new PrismaClient();

// Helper function to generate random dates
const getRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to generate random number in range
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random array element
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  try {
    // Clear existing data (except company if exists)
    console.log("🧹 Cleaning existing data...");
    await prisma.payslip.deleteMany();
    await prisma.payrunLine.deleteMany();
    await prisma.payrun.deleteMany();
    await prisma.timeOff.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.reportLog.deleteMany();

    // Create company if not exists
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "WorkZen Technologies",
          code: "WORKZEN",
          email: "contact@workzen.com",
          phone: "+91-9876543210",
          isActive: true,
        },
      });
    }
    console.log("✅ Company created/found");

    // Create departments
    const departments = [
      "Engineering",
      "Human Resources",
      "Finance",
      "Marketing",
      "Sales",
      "Operations",
      "Design",
      "Quality Assurance",
    ];

    for (const deptName of departments) {
      await prisma.department.create({
        data: { name: deptName },
      });
    }
    console.log("✅ Departments created");

    // Create users and employees
    const userData = [
      // Admin users
      {
        name: "Admin User",
        email: "admin@gmail.com",
        role: "ADMIN",
        department: "Human Resources",
        designation: "System Administrator",
        salary: 120000,
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@workzen.com",
        role: "ADMIN",
        department: "Human Resources",
        designation: "HR Director",
        salary: 150000,
      },

      // HR users
      {
        name: "Mike Johnson",
        email: "mike.johnson@workzen.com",
        role: "HR",
        department: "Human Resources",
        designation: "HR Manager",
        salary: 80000,
      },
      {
        name: "Emily Davis",
        email: "emily.davis@workzen.com",
        role: "HR",
        department: "Human Resources",
        designation: "HR Business Partner",
        salary: 75000,
      },

      // Payroll users
      {
        name: "David Brown",
        email: "david.brown@workzen.com",
        role: "PAYROLL",
        department: "Finance",
        designation: "Payroll Manager",
        salary: 85000,
      },
      {
        name: "Lisa Garcia",
        email: "lisa.garcia@workzen.com",
        role: "PAYROLL",
        department: "Finance",
        designation: "Payroll Specialist",
        salary: 65000,
      },

      // Employees
      {
        name: "John Doe",
        email: "john.doe@workzen.com",
        role: "EMPLOYEE",
        department: "Engineering",
        designation: "Senior Software Engineer",
        salary: 95000,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@workzen.com",
        role: "EMPLOYEE",
        department: "Engineering",
        designation: "Frontend Developer",
        salary: 75000,
      },
      {
        name: "Robert Wilson",
        email: "robert.wilson@workzen.com",
        role: "EMPLOYEE",
        department: "Engineering",
        designation: "Backend Developer",
        salary: 80000,
      },
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@workzen.com",
        role: "EMPLOYEE",
        department: "Design",
        designation: "UI/UX Designer",
        salary: 70000,
      },
      {
        name: "Michael Anderson",
        email: "michael.anderson@workzen.com",
        role: "EMPLOYEE",
        department: "Marketing",
        designation: "Marketing Manager",
        salary: 78000,
      },
      {
        name: "Ashley Taylor",
        email: "ashley.taylor@workzen.com",
        role: "EMPLOYEE",
        department: "Sales",
        designation: "Sales Executive",
        salary: 60000,
      },
      {
        name: "Christopher Thomas",
        email: "christopher.thomas@workzen.com",
        role: "EMPLOYEE",
        department: "Quality Assurance",
        designation: "QA Engineer",
        salary: 65000,
      },
      {
        name: "Amanda Jackson",
        email: "amanda.jackson@workzen.com",
        role: "EMPLOYEE",
        department: "Operations",
        designation: "Operations Specialist",
        salary: 62000,
      },
      {
        name: "Daniel White",
        email: "daniel.white@workzen.com",
        role: "EMPLOYEE",
        department: "Finance",
        designation: "Financial Analyst",
        salary: 72000,
      },
      {
        name: "Nicole Harris",
        email: "nicole.harris@workzen.com",
        role: "EMPLOYEE",
        department: "Engineering",
        designation: "DevOps Engineer",
        salary: 85000,
      },
    ];

    const password = await bcrypt.hash("1234567890", 12);
    const users = [];
    const employees = [];

    for (let i = 0; i < userData.length; i++) {
      const data = userData[i];
      const userId = await generateUserId(
        data.name.split(" ")[0],
        data.name.split(" ")[1]
      );

      const user = await prisma.user.create({
        data: {
          userId: userId,
          name: data.name,
          email: data.email,
          password: password,
          role: data.role,
          isVerified: true,
          companyId: company.id,
        },
      });
      users.push(user);

      // Create employee record
      const joinDate = getRandomDate(
        new Date(2020, 0, 1),
        new Date(2024, 11, 31)
      );
      const employee = await prisma.employee.create({
        data: {
          userId: user.id,
          employeeCode: `EMP${String(i + 1).padStart(3, "0")}`,
          department: data.department,
          designation: data.designation,
          baseSalary: data.salary,
          allowances: data.salary * 0.2, // 20% allowances
          pfApplicable: true,
          professionalTaxApplicable: true,
          joinDate: joinDate,
          status: "ACTIVE",
          // Personal info
          dateOfBirth: getRandomDate(
            new Date(1980, 0, 1),
            new Date(2000, 11, 31)
          ),
          address: `${getRandomNumber(1, 999)} ${getRandomElement([
            "Main St",
            "Oak Ave",
            "Pine Rd",
            "Elm St",
            "Park Ave",
          ])}, ${getRandomElement([
            "Mumbai",
            "Delhi",
            "Bangalore",
            "Chennai",
            "Hyderabad",
          ])}`,
          gender: getRandomElement(["Male", "Female"]),
          nationality: "Indian",
          maritalStatus: getRandomElement(["Single", "Married"]),
          phone: `+91-${getRandomNumber(7000000000, 9999999999)}`,
          emergencyContactName: `Emergency Contact ${i + 1}`,
          emergencyContactPhone: `+91-${getRandomNumber(
            7000000000,
            9999999999
          )}`,
          emergencyContactRelation: getRandomElement([
            "Spouse",
            "Parent",
            "Sibling",
          ]),
          aadharNumber: `${getRandomNumber(1000, 9999)}-${getRandomNumber(
            1000,
            9999
          )}-${getRandomNumber(1000, 9999)}`,
          panNumber: `${getRandomElement(["A", "B", "C"])}${getRandomElement([
            "A",
            "B",
            "C",
          ])}${getRandomElement(["A", "B", "C"])}${getRandomElement([
            "P",
            "C",
            "H",
          ])}${getRandomElement(["A", "B", "C"])}${getRandomNumber(
            1000,
            9999
          )}${getRandomElement(["A", "B", "C"])}`,
          // Bank details
          bankAccountNumber: `${getRandomNumber(10000000000, 99999999999)}`,
          bankName: getRandomElement([
            "SBI",
            "HDFC Bank",
            "ICICI Bank",
            "Axis Bank",
            "Kotak Bank",
          ]),
          ifscCode: `${getRandomElement([
            "SBIN",
            "HDFC",
            "ICIC",
            "UTIB",
            "KKBK",
          ])}0001234`,
          accountHolderName: data.name,
          accountType: "SAVINGS",
        },
      });
      employees.push(employee);
    }
    console.log("✅ Users and employees created");

    // Create skills for employees
    const skillsList = [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "SQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "Agile",
      "Scrum",
      "Leadership",
      "Communication",
      "Project Management",
      "Data Analysis",
      "UI/UX Design",
      "Marketing",
      "Sales",
      "Finance",
      "Operations",
    ];

    const proficiencyLevels = [
      "Beginner",
      "Intermediate",
      "Advanced",
      "Expert",
    ];

    for (const employee of employees) {
      const numSkills = getRandomNumber(3, 8);
      const employeeSkills = [];

      for (let i = 0; i < numSkills; i++) {
        const skill = getRandomElement(skillsList);
        if (!employeeSkills.includes(skill)) {
          employeeSkills.push(skill);
          await prisma.skill.create({
            data: {
              employeeId: employee.id,
              name: skill,
              proficiency: getRandomElement(proficiencyLevels),
            },
          });
        }
      }
    }
    console.log("✅ Skills created");

    // Create certifications
    const certifications = [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional",
      "Microsoft Azure Fundamentals",
      "Certified Scrum Master",
      "PMP Certification",
      "React Developer Certification",
      "Node.js Certification",
      "MongoDB Certified Developer",
      "Docker Certified Associate",
      "Kubernetes Administrator",
      "Salesforce Administrator",
      "HubSpot Certification",
    ];

    for (const employee of employees) {
      const numCerts = getRandomNumber(1, 4);

      for (let i = 0; i < numCerts; i++) {
        const issueDate = getRandomDate(new Date(2020, 0, 1), new Date());
        const validityDate = new Date(issueDate);
        validityDate.setFullYear(
          validityDate.getFullYear() + getRandomNumber(2, 5)
        );

        await prisma.certification.create({
          data: {
            employeeId: employee.id,
            name: getRandomElement(certifications),
            issueDate: issueDate,
            validityDate: validityDate,
          },
        });
      }
    }
    console.log("✅ Certifications created");

    // Create attendance records for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    for (const employee of employees) {
      for (
        let d = new Date(thirtyDaysAgo);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const currentDate = new Date(d);

        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

        // 90% attendance rate
        if (Math.random() > 0.9) continue;

        const checkInHour = getRandomNumber(8, 10);
        const checkInMinute = getRandomNumber(0, 59);
        const checkIn = new Date(currentDate);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);

        const checkOutHour = checkInHour + getRandomNumber(8, 10);
        const checkOutMinute = getRandomNumber(0, 59);
        const checkOut = new Date(currentDate);
        checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);

        const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: currentDate,
            checkIn: checkIn,
            checkOut: checkOut,
            totalHours: totalHours,
            status: totalHours >= 8 ? "PRESENT" : "PARTIAL",
          },
        });
      }
    }
    console.log("✅ Attendance records created");

    // Create time-off requests
    const timeOffTypes = [
      "Sick Leave",
      "Casual Leave",
      "Annual Leave",
      "Personal Leave",
      "Maternity Leave",
    ];
    const statuses = ["PENDING", "APPROVED", "REJECTED"];

    for (const employee of employees) {
      const numRequests = getRandomNumber(2, 8);

      for (let i = 0; i < numRequests; i++) {
        const fromDate = getRandomDate(
          new Date(2024, 0, 1),
          new Date(2024, 11, 31)
        );
        const toDate = new Date(fromDate);
        toDate.setDate(fromDate.getDate() + getRandomNumber(1, 5));

        await prisma.timeOff.create({
          data: {
            employeeId: employee.id,
            fromDate: fromDate,
            toDate: toDate,
            type: getRandomElement(timeOffTypes),
            reason: `Time off request for ${getRandomElement(
              timeOffTypes
            ).toLowerCase()}`,
            status: getRandomElement(statuses),
            approverId: getRandomElement(
              users.filter((u) => ["ADMIN", "HR", "PAYROLL"].includes(u.role))
            ).id,
          },
        });
      }
    }
    console.log("✅ Time-off requests created");

    // Create payrun records
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }

    for (const month of months) {
      const payrun = await prisma.payrun.create({
        data: {
          periodStart: month.start,
          periodEnd: month.end,
          status: "FINALIZED",
          createdBy: users.find((u) => u.role === "PAYROLL").id,
        },
      });

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const employee of employees) {
        const gross = employee.baseSalary + employee.allowances;
        const pfEmployee = gross * 0.12; // 12% PF
        const professionalTax = 200; // Fixed PT
        const otherDeductions = getRandomNumber(0, 1000);
        const unpaidDeduction = getRandomNumber(0, 2000);
        const totalDed =
          pfEmployee + professionalTax + otherDeductions + unpaidDeduction;
        const net = gross - totalDed;

        totalGross += gross;
        totalDeductions += totalDed;
        totalNet += net;

        const payrunLine = await prisma.payrunLine.create({
          data: {
            payrunId: payrun.id,
            employeeId: employee.id,
            gross: gross,
            unpaidDeduction: unpaidDeduction,
            pfEmployee: pfEmployee,
            professionalTax: professionalTax,
            otherDeductions: otherDeductions,
            net: net,
            remarks: "Regular monthly salary",
          },
        });

        // Create payslip
        await prisma.payslip.create({
          data: {
            payrunLineId: payrunLine.id,
            filePath: `/payslips/${
              employee.employeeCode
            }_${month.start.getFullYear()}_${month.start.getMonth() + 1}.pdf`,
          },
        });
      }

      // Update payrun totals
      await prisma.payrun.update({
        where: { id: payrun.id },
        data: {
          totalGross: totalGross,
          totalDeductions: totalDeductions,
          totalNet: totalNet,
        },
      });
    }
    console.log("✅ Payrun records and payslips created");

    // Create notifications
    const notificationTypes = ["INFO", "WARNING", "SUCCESS", "ERROR"];
    const notificationMessages = [
      "Welcome to WorkZen HRMS!",
      "Your time-off request has been approved",
      "Monthly payslip is now available",
      "Please update your profile information",
      "New company policy has been published",
      "Reminder: Submit your timesheet",
      "Performance review scheduled",
      "Training session reminder",
    ];

    for (const user of users) {
      const numNotifications = getRandomNumber(3, 10);

      for (let i = 0; i < numNotifications; i++) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: getRandomElement(notificationMessages),
            type: getRandomElement(notificationTypes),
            isRead: Math.random() > 0.3, // 70% read rate
          },
        });
      }
    }
    console.log("✅ Notifications created");

    // Create report logs
    const reportTypes = ["ATTENDANCE", "PAYROLL", "LEAVE", "EMPLOYEE"];

    for (let i = 0; i < 20; i++) {
      await prisma.reportLog.create({
        data: {
          generatedBy: getRandomElement(
            users.filter((u) => ["ADMIN", "HR", "PAYROLL"].includes(u.role))
          ).id,
          type: getRandomElement(reportTypes),
          filePath: `/reports/${getRandomElement(
            reportTypes
          ).toLowerCase()}_report_${Date.now()}.pdf`,
        },
      });
    }
    console.log("✅ Report logs created");

    // Create audit logs
    const auditActions = [
      "USER_LOGIN",
      "USER_LOGOUT",
      "EMPLOYEE_CREATED",
      "EMPLOYEE_UPDATED",
      "ATTENDANCE_MARKED",
      "TIMEOFF_REQUESTED",
      "TIMEOFF_APPROVED",
      "PAYROLL_GENERATED",
      "REPORT_GENERATED",
      "SETTINGS_UPDATED",
      "PROFILE_UPDATED",
    ];

    for (let i = 0; i < 50; i++) {
      const user = getRandomElement(users);
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: getRandomElement(auditActions),
          details: `Action performed by ${user.name}`,
          timestamp: getRandomDate(new Date(2024, 0, 1), new Date()),
        },
      });
    }
    console.log("✅ Audit logs created");

    console.log("🎉 Comprehensive database seeded successfully!");

    console.log("\n📋 Login Credentials:");
    console.log("=".repeat(50));
    console.log("ADMIN: admin@gmail.com / 1234567890");
    console.log("HR: mike.johnson@workzen.com / 1234567890");
    console.log("PAYROLL: david.brown@workzen.com / 1234567890");
    console.log("EMPLOYEE: john.doe@workzen.com / 1234567890");
    console.log("=".repeat(50));
    console.log(`📊 Data Summary:`);
    console.log(`- ${users.length} Users created`);
    console.log(`- ${employees.length} Employees created`);
    console.log(`- ${departments.length} Departments created`);
    console.log(`- Attendance records for last 30 days`);
    console.log(`- 6 months of payroll data`);
    console.log(`- Multiple time-off requests per employee`);
    console.log(`- Skills and certifications for all employees`);
    console.log(`- Notifications and audit logs`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
