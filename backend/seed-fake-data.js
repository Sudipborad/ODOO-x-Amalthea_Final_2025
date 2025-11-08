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
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        address: `${Math.floor(Math.random() * 999) + 1} Main St, City, State ${String(Math.floor(Math.random() * 90000) + 10000)}`,
        emergencyContactName: `Emergency Contact ${i + 1}`,
        emergencyContactPhone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
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

    console.log(`✅ Created user and employee: ${data.name}`);
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
  console.log(`- Users/Employees: ${userData.length}`);
  console.log(`- Attendance records: ~${userData.length * 20} (last 30 days)`);
  console.log(`- Time-off requests: ~${userData.length * 2}`);
  console.log(`- Payroll records: ${userData.length * 3} (last 3 months)`);
  console.log(`- Skills and certifications added`);
  console.log(`- Notifications: 10`);
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