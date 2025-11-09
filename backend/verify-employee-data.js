const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verifying employee profile data...\n');

  const employees = await prisma.employee.findMany({
    include: {
      user: true
    }
  });

  employees.forEach((emp, index) => {
    console.log(`Employee ${index + 1}: ${emp.user.name}`);
    console.log(`- Phone: ${emp.phone || 'Not set'}`);
    console.log(`- Date of Birth: ${emp.dateOfBirth || 'Not set'}`);
    console.log(`- Blood Group: ${emp.bloodGroup || 'Not set'}`);
    console.log(`- Marital Status: ${emp.maritalStatus || 'Not set'}`);
    console.log(`- Address: ${emp.address || 'Not set'}`);
    console.log(`- Bank: ${emp.bankName || 'Not set'}`);
    console.log(`- PAN: ${emp.panNumber || 'Not set'}`);
    console.log(`- Emergency Contact: ${emp.emergencyContactName || 'Not set'}`);
    console.log('---');
  });

  console.log(`\n✅ Total employees with profile data: ${employees.length}`);
}

verifyData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());