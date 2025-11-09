const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDates() {
  console.log('🔧 Fixing date of birth to show only date without time...\n');

  const employees = await prisma.employee.findMany({
    where: {
      dateOfBirth: {
        not: null
      }
    }
  });

  for (const emp of employees) {
    if (emp.dateOfBirth) {
      // Create new date with only date part (no time)
      const dateOnly = new Date(emp.dateOfBirth);
      dateOnly.setHours(0, 0, 0, 0);
      
      await prisma.employee.update({
        where: { id: emp.id },
        data: { dateOfBirth: dateOnly }
      });
      
      console.log(`✅ Fixed date for employee ID ${emp.id}`);
    }
  }

  console.log(`\n🎉 Fixed ${employees.length} employee dates`);
}

fixDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());