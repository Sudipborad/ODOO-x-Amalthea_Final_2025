const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users with hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const hrPassword = await bcrypt.hash('hr123', 12);
  const payrollPassword = await bcrypt.hash('payroll123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workzen.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@workzen.com',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true
    }
  });

  // Create HR user
  const hr = await prisma.user.upsert({
    where: { email: 'hr@workzen.com' },
    update: {},
    create: {
      name: 'HR Manager',
      email: 'hr@workzen.com',
      password: hrPassword,
      role: 'HR',
      isVerified: true
    }
  });

  // Create Payroll user
  const payroll = await prisma.user.upsert({
    where: { email: 'payroll@workzen.com' },
    update: {},
    create: {
      name: 'Payroll Officer',
      email: 'payroll@workzen.com',
      password: payrollPassword,
      role: 'PAYROLL',
      isVerified: true
    }
  });

  // Create Employee users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@workzen.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@workzen.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      isVerified: true
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@workzen.com' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@workzen.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      isVerified: true
    }
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@workzen.com' },
    update: {},
    create: {
      name: 'Charlie Brown',
      email: 'charlie@workzen.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      isVerified: true
    }
  });

  console.log('✅ Users created');

  // Create Employee records
  const aliceEmployee = await prisma.employee.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      employeeCode: 'EMP001',
      department: 'Engineering',
      designation: 'Software Developer',
      baseSalary: 50000,
      allowances: 5000,
      pfApplicable: true,
      professionalTaxApplicable: true,
      joinDate: new Date('2024-01-15'),
      bankAccountMasked: '****1234'
    }
  });

  const bobEmployee = await prisma.employee.upsert({
    where: { userId: bob.id },
    update: {},
    create: {
      userId: bob.id,
      employeeCode: 'EMP002',
      department: 'Marketing',
      designation: 'Marketing Manager',
      baseSalary: 45000,
      allowances: 4000,
      pfApplicable: true,
      professionalTaxApplicable: true,
      joinDate: new Date('2024-02-01'),
      bankAccountMasked: '****5678'
    }
  });

  const charlieEmployee = await prisma.employee.upsert({
    where: { userId: charlie.id },
    update: {},
    create: {
      userId: charlie.id,
      employeeCode: 'EMP003',
      department: 'Finance',
      designation: 'Accountant',
      baseSalary: 40000,
      allowances: 3000,
      pfApplicable: true,
      professionalTaxApplicable: true,
      joinDate: new Date('2024-01-01'),
      bankAccountMasked: '****9012'
    }
  });

  console.log('✅ Employee records created');

  // Create attendance records for the current month
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const today = new Date();
  
  const employees = [aliceEmployee, bobEmployee, charlieEmployee];
  
  for (const employee of employees) {
    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Alice has 2 unpaid days (absent)
      const isAliceAbsent = employee.id === aliceEmployee.id && (day === 5 || day === 12);
      
      const status = isAliceAbsent ? 'ABSENT' : 'PRESENT';
      const checkIn = isAliceAbsent ? null : new Date(date.setHours(9, 0, 0, 0));
      const checkOut = isAliceAbsent ? null : new Date(date.setHours(18, 0, 0, 0));
      const totalHours = isAliceAbsent ? null : 9;

      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          }
        },
        update: {},
        create: {
          employeeId: employee.id,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
          checkIn,
          checkOut,
          totalHours,
          status
        }
      });
    }
  }

  console.log('✅ Attendance records created');

  // Create a pending time-off request for Alice
  await prisma.timeOff.upsert({
    where: { id: 1 },
    update: {},
    create: {
      employeeId: aliceEmployee.id,
      fromDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      toDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      type: 'CASUAL',
      reason: 'Family vacation',
      status: 'PENDING'
    }
  });

  console.log('✅ Time-off request created');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        role: 'ADMIN',
        action: 'SYSTEM_SEEDED',
        details: 'Database seeded with initial data'
      },
      {
        userId: alice.id,
        role: 'EMPLOYEE',
        action: 'USER_REGISTERED',
        details: 'Employee Alice Johnson registered'
      }
    ]
  });

  console.log('✅ Audit logs created');
  console.log('🎉 Database seeded successfully!');
  
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@workzen.com / admin123');
  console.log('HR: hr@workzen.com / hr123');
  console.log('Payroll: payroll@workzen.com / payroll123');
  console.log('Employee: alice@workzen.com / employee123');
  console.log('Employee: bob@workzen.com / employee123');
  console.log('Employee: charlie@workzen.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });