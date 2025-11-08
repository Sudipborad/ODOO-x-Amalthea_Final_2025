const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Clearing all data...');

  // Delete in correct order to avoid foreign key constraints
  await prisma.payslip.deleteMany();
  await prisma.payrunLine.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.emailToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All data cleared');
}

resetDatabase()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });