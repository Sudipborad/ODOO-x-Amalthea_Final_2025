const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPayslips() {
  console.log('🔍 Checking payslips data...\n');

  const payslips = await prisma.payslip.findMany({
    include: {
      payrunLine: {
        include: {
          employee: {
            include: {
              user: true
            }
          },
          payrun: true
        }
      }
    }
  });

  console.log(`Found ${payslips.length} payslips`);
  
  if (payslips.length > 0) {
    payslips.forEach((payslip, index) => {
      console.log(`\nPayslip ${index + 1}:`);
      console.log(`- ID: ${payslip.id}`);
      console.log(`- Employee: ${payslip.payrunLine.employee.user.name}`);
      console.log(`- Period: ${payslip.payrunLine.payrun.periodStart} to ${payslip.payrunLine.payrun.periodEnd}`);
      console.log(`- Gross: ${payslip.payrunLine.gross}`);
      console.log(`- Net: ${payslip.payrunLine.net}`);
      console.log(`- Generated: ${payslip.generatedAt}`);
    });
  }

  const payruns = await prisma.payrun.findMany({
    include: {
      payrunLines: {
        include: {
          employee: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  console.log(`\nFound ${payruns.length} payruns`);
  
  if (payruns.length > 0) {
    payruns.forEach((payrun, index) => {
      console.log(`\nPayrun ${index + 1}:`);
      console.log(`- ID: ${payrun.id}`);
      console.log(`- Period: ${payrun.periodStart} to ${payrun.periodEnd}`);
      console.log(`- Status: ${payrun.status}`);
      console.log(`- Employees: ${payrun.payrunLines.length}`);
      console.log(`- Total Gross: ${payrun.totalGross}`);
      console.log(`- Total Net: ${payrun.totalNet}`);
    });
  }
}

checkPayslips()
  .catch(console.error)
  .finally(() => prisma.$disconnect());