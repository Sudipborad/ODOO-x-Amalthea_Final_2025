const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding fake data...');

  // Create company
  const company = await prisma.company.upsert({
    where: { code: 'TECH01' },
    update: {},
    create: {
      name: 'TechCorp Solutions',
      code: 'TECH01',
      email: 'info@techcorp.com',
      phone: '+1-555-0123'
    }
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: { name: 'Engineering' }
    }),
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: { name: 'Human Resources' }
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: { name: 'Marketing' }
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: { name: 'Finance' }
    })
  ]);

  // Create users and employees
  const userData = [
    { name: 'John Smith', email: 'john@techcorp.com', role: 'ADMIN', dept: 'Engineering', designation: 'CTO', salary: 120000 },
    { name: 'Sarah Johnson', email: 'sarah@techcorp.com', role: 'HR', dept: 'Human Resources', designation: 'HR Manager', salary: 85000 },
    { name: 'Mike Davis', email: 'mike@techcorp.com', role: 'EMPLOYEE', dept: 'Engineering', designation: 'Senior Developer', salary: 95000 },
    { name: 'Emily Wilson', email: 'emily@techcorp.com', role: 'EMPLOYEE', dept: 'Marketing', designation: 'Marketing Specialist', salary: 65000 },
    { name: 'David Brown', email: 'david@techcorp.com', role: 'PAYROLL', dept: 'Finance', designation: 'Finance Manager', salary: 90000 },
    { name: 'Lisa Garcia', email: 'lisa@techcorp.com', role: 'EMPLOYEE', dept: 'Engineering', designation: 'Frontend Developer', salary: 80000 },
    { name: 'Tom Anderson', email: 'tom@techcorp.com', role: 'EMPLOYEE', dept: 'Engineering', designation: 'Backend Developer', salary: 85000 },
    { name: 'Anna Martinez', email: 'anna@techcorp.com', role: 'EMPLOYEE', dept: 'Marketing', designation: 'Content Creator', salary: 55000 }
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (let i = 0; i < userData.length; i++) {
    const data = userData[i];
    const dept = departments.find(d => d.name === data.dept);
    
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isVerified: true,
        companyId: company.id
      }
    });

    const employee = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeCode: `TECH${String(i + 1).padStart(3, '0')}`,
        department: data.dept,
        designation: data.designation,
        baseSalary: data.salary,
        joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        // Personal Info
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dateOfBirth: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, 0, 0, 0, 0),
        address: [
          '123 Tech Park, Bangalore, Karnataka 560001',
          '456 IT Hub, Hyderabad, Telangana 500032', 
          '789 Software City, Pune, Maharashtra 411001',
          '321 Cyber City, Gurgaon, Haryana 122002',
          '654 Innovation Park, Chennai, Tamil Nadu 600001',
          '987 Digital Valley, Mumbai, Maharashtra 400001',
          '147 Tech Tower, Noida, Uttar Pradesh 201301',
          '258 IT Plaza, Kochi, Kerala 682001'
        ][i % 8],
        permanentAddress: [
          '12 Gandhi Nagar, Delhi 110001',
          '34 MG Road, Bangalore 560001',
          '56 Park Street, Kolkata 700016', 
          '78 Marine Drive, Mumbai 400002',
          '90 Anna Salai, Chennai 600002',
          '11 Sector 17, Chandigarh 160017',
          '22 Civil Lines, Jaipur 302006',
          '33 Station Road, Lucknow 226001'
        ][i % 8],
        city: ['Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Chennai', 'Mumbai', 'Noida', 'Kochi'][i % 8],
        state: ['Karnataka', 'Telangana', 'Maharashtra', 'Haryana', 'Tamil Nadu', 'Maharashtra', 'Uttar Pradesh', 'Kerala'][i % 8],
        zipCode: ['560001', '500032', '411001', '122002', '600001', '400001', '201301', '682001'][i % 8],
        gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
        maritalStatus: ['Single', 'Married', 'Divorced'][Math.floor(Math.random() * 3)],
        alternatePhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        personalEmail: `${data.name.toLowerCase().replace(' ', '.')}@gmail.com`,
        // Emergency Contact
        emergencyContactName: [
          'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh',
          'Vikram Gupta', 'Meera Reddy', 'Arjun Nair', 'Kavya Iyer'
        ][i % 8],
        emergencyContactPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emergencyContactRelation: ['Father', 'Mother', 'Spouse', 'Brother', 'Sister'][Math.floor(Math.random() * 5)],
        emergencyContactAddress: [
          '12 Gandhi Nagar, Delhi 110001',
          '34 MG Road, Bangalore 560001', 
          '56 Park Street, Kolkata 700016',
          '78 Marine Drive, Mumbai 400002'
        ][i % 4],
        // Government IDs
        aadharNumber: `${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        // Professional Info
        workLocation: ['Bangalore Office', 'Hyderabad Office', 'Pune Office', 'Mumbai Office'][Math.floor(Math.random() * 4)],
        reportingManager: i > 0 ? userData[Math.floor(Math.random() * i)].name : null,
        workType: ['FULL_TIME', 'PART_TIME', 'CONTRACT'][Math.floor(Math.random() * 3)],
        probationPeriod: [3, 6, 12][Math.floor(Math.random() * 3)],
        confirmationDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        previousCompany: [
          'Infosys', 'TCS', 'Wipro', 'Accenture', 'IBM', 'Microsoft', 'Google', 'Amazon'
        ][Math.floor(Math.random() * 8)],
        previousDesignation: [
          'Software Engineer', 'Senior Developer', 'Team Lead', 'Project Manager'
        ][Math.floor(Math.random() * 4)],
        totalExperience: Math.floor(Math.random() * 10) + 1,
        // Bank Details
        bankAccountNumber: `${Math.floor(Math.random() * 90000000000000) + 10000000000000}`,
        bankName: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'][Math.floor(Math.random() * 5)],
        bankBranch: ['MG Road Branch', 'Koramangala Branch', 'Whitefield Branch'][Math.floor(Math.random() * 3)],
        ifscCode: ['HDFC0000001', 'ICIC0000001', 'SBIN0000001', 'UTIB0000001', 'KKBK0000001'][Math.floor(Math.random() * 5)],
        accountHolderName: data.name,
        accountType: ['SAVINGS', 'CURRENT'][Math.floor(Math.random() * 2)],
        upiId: `${data.name.toLowerCase().replace(' ', '.')}@paytm`,
        // Additional Financial
        pfNumber: `KA/BGE/${String(Math.floor(Math.random() * 900000) + 100000)}/${String(Math.floor(Math.random() * 900) + 100)}`,
        uanNumber: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
        esiNumber: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        // Health & Benefits
        bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
        medicalConditions: Math.random() < 0.3 ? ['Diabetes', 'Hypertension', 'Asthma'][Math.floor(Math.random() * 3)] : 'None',
        insuranceNominee: [
          'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh'
        ][Math.floor(Math.random() * 4)],
        insuranceNomineeRelation: ['Spouse', 'Father', 'Mother', 'Child'][Math.floor(Math.random() * 4)]
      }
    });

    // Create attendance records for the last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // 85% attendance rate (some days absent)
      if (Math.random() < 0.15) continue;

      const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMinute);

      const workHours = 8 + Math.random() * 2; // 8-10 hours
      const checkOut = new Date(checkIn);
      checkOut.setHours(checkIn.getHours() + Math.floor(workHours), checkIn.getMinutes() + Math.round((workHours % 1) * 60));

      // Most should be PRESENT for better analytics
      const status = checkInHour > 9 ? 'LATE' : 'PRESENT';

      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: date
          }
        },
        update: {},
        create: {
          employeeId: employee.id,
          date: date,
          checkIn: checkIn,
          checkOut: checkOut,
          totalHours: Math.round(workHours * 100) / 100,
          status: status
        }
      });
    }

    // Create time-off requests
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      // Mix of past, current, and future dates
      const daysOffset = Math.floor(Math.random() * 90) - 15; // -15 to +75 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + daysOffset);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1);

      // Ensure some active leaves (approved and within current period)
      let status;
      if (j === 0 && daysOffset <= 5 && daysOffset >= -5) {
        // First request near current date should be approved and active
        status = 'APPROVED';
      } else {
        status = ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)];
      }

      await prisma.timeOff.create({
        data: {
          employeeId: employee.id,
          type: ['ANNUAL', 'SICK', 'CASUAL', 'UNPAID'][Math.floor(Math.random() * 4)],
          fromDate: startDate,
          toDate: endDate,
          reason: `Time off request ${j + 1} for ${data.name}`,
          status: status
        }
      });
    }

    // Create payrun for last 3 months including current month
    for (let month = 0; month < 3; month++) {
      const payrollDate = new Date();
      payrollDate.setMonth(payrollDate.getMonth() - month);
      const periodStart = new Date(payrollDate.getFullYear(), payrollDate.getMonth(), 1);
      const periodEnd = new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 0);

      const grossSalary = data.salary / 12;
      const pf = grossSalary * 0.12;
      const professionalTax = 200;
      const netSalary = grossSalary - pf - professionalTax;

      // Create or find payrun
      let payrun = await prisma.payrun.findFirst({
        where: {
          periodStart: periodStart,
          periodEnd: periodEnd
        }
      });

      if (!payrun) {
        // Find admin user to use as creator
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN' }
        });
        
        payrun = await prisma.payrun.create({
          data: {
            periodStart: periodStart,
            periodEnd: periodEnd,
            status: 'FINALIZED',
            createdBy: adminUser?.id || user.id,
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0
          }
        });
      }

      // Check if payrun line already exists
      const existingLine = await prisma.payrunLine.findFirst({
        where: {
          payrunId: payrun.id,
          employeeId: employee.id
        }
      });

      if (!existingLine) {
        await prisma.payrunLine.create({
          data: {
            payrunId: payrun.id,
            employeeId: employee.id,
            gross: grossSalary,
            unpaidDeduction: 0,
            pfEmployee: pf,
            professionalTax: professionalTax,
            otherDeductions: 0,
            net: netSalary
          }
        });
      }
    }
    
    // Update payrun totals after all employees are processed
    // This will be done at the end of the script

    // Create skills
    const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'];
    const usedSkills = new Set();
    for (let k = 0; k < Math.floor(Math.random() * 4) + 2; k++) {
      let skill;
      do {
        skill = skills[Math.floor(Math.random() * skills.length)];
      } while (usedSkills.has(skill));
      usedSkills.add(skill);
      
      await prisma.skill.create({
        data: {
          employeeId: employee.id,
          name: skill,
          proficiency: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
        }
      });
    }

    // Create certifications
    if (Math.random() < 0.6) {
      const certs = ['AWS Certified', 'Google Cloud Certified', 'Microsoft Certified', 'Scrum Master'];
      const cert = certs[Math.floor(Math.random() * certs.length)];
      await prisma.certification.create({
        data: {
          employeeId: employee.id,
          name: cert,
          issueDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          validityDate: new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        }
      });
    }

    console.log(`✅ Created user and employee: ${data.name} with complete profile`);
  }

  // Create some notifications
  const users = await prisma.user.findMany();
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `This is a sample notification message ${i + 1}`,
        type: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'][Math.floor(Math.random() * 4)],
        isRead: Math.random() < 0.5
      }
    });
  }

  // Update all payrun totals
  const allPayruns = await prisma.payrun.findMany();
  for (const payrun of allPayruns) {
    const payrunLines = await prisma.payrunLine.findMany({
      where: { payrunId: payrun.id }
    });
    
    const totalGross = payrunLines.reduce((sum, line) => sum + (line.gross || 0), 0);
    const totalDeductions = payrunLines.reduce((sum, line) => sum + (line.pfEmployee || 0) + (line.professionalTax || 0) + (line.otherDeductions || 0), 0);
    const totalNet = payrunLines.reduce((sum, line) => sum + (line.net || 0), 0);
    
    await prisma.payrun.update({
      where: { id: payrun.id },
      data: {
        totalGross: totalGross,
        totalDeductions: totalDeductions,
        totalNet: totalNet
      }
    });
  }

  console.log('🎉 Fake data seeding completed!');
  console.log('📊 Summary:');
  console.log(`- Company: ${company.name}`);
  console.log(`- Departments: ${departments.length}`);
  console.log(`- Users/Employees: ${userData.length} with complete profiles`);
  console.log(`- Attendance records: ~${userData.length * 20} (last 30 days)`);
  console.log(`- Time-off requests: ~${userData.length * 2}`);
  console.log(`- Payroll records: ${userData.length * 3} (last 3 months)`);
  console.log(`- Skills and certifications added`);
  console.log(`- Notifications: 10`);
  console.log(`- Complete profile data: Personal, Professional, Bank, Government IDs`);
  console.log(`- Payrun totals updated`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });