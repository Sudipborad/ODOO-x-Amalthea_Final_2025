const prisma = require('../config/prisma');

const WORKING_DAYS_PER_MONTH = 22;

const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
      workingDays++;
    }
  }
  
  return workingDays || WORKING_DAYS_PER_MONTH;
};

const calculateUnpaidDays = async (employeeId, periodStart, periodEnd) => {
  // Get approved unpaid leave days
  const unpaidLeaves = await prisma.timeOff.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      type: 'UNPAID',
      fromDate: { lte: periodEnd },
      toDate: { gte: periodStart }
    }
  });

  let unpaidDays = 0;
  unpaidLeaves.forEach(leave => {
    const leaveStart = new Date(Math.max(leave.fromDate, periodStart));
    const leaveEnd = new Date(Math.min(leave.toDate, periodEnd));
    unpaidDays += calculateWorkingDays(leaveStart, leaveEnd);
  });

  // Check for missing attendance (simplified - count missing days)
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: periodStart,
        lte: periodEnd
      },
      status: 'ABSENT'
    }
  });

  unpaidDays += attendanceRecords.length;
  return unpaidDays;
};

const computePayroll = async (periodStart, periodEnd) => {
  const employees = await prisma.employee.findMany({
    include: {
      user: true
    },
    where: {
      joinDate: { lte: periodEnd }
    }
  });

  const payrollData = [];

  for (const employee of employees) {
    const workingDays = calculateWorkingDays(periodStart, periodEnd);
    const unpaidDays = await calculateUnpaidDays(employee.id, periodStart, periodEnd);
    
    // Calculate pro-rata if joined mid-period
    const joinDate = new Date(employee.joinDate);
    const actualWorkingDays = joinDate > periodStart ? 
      calculateWorkingDays(joinDate, periodEnd) : workingDays;

    const gross = employee.baseSalary + employee.allowances;
    const unpaidDeduction = (employee.baseSalary / workingDays) * unpaidDays;
    const pfEmployee = employee.pfApplicable ? employee.baseSalary * 0.12 : 0;
    const professionalTax = employee.professionalTaxApplicable ? 200 : 0;
    const otherDeductions = 0; // Can be extended for loans/advances
    
    const net = Math.round((gross - (unpaidDeduction + pfEmployee + professionalTax + otherDeductions)) * 100) / 100;

    payrollData.push({
      employeeId: employee.id,
      name: employee.user.name,
      employeeCode: employee.employeeCode,
      department: employee.department,
      designation: employee.designation,
      gross: Math.round(gross * 100) / 100,
      unpaidDeduction: Math.round(unpaidDeduction * 100) / 100,
      pfEmployee: Math.round(pfEmployee * 100) / 100,
      professionalTax,
      otherDeductions,
      net,
      workingDays: actualWorkingDays,
      unpaidDays
    });
  }

  return payrollData;
};

const finalizePayroll = async (periodStart, periodEnd, payrollData, createdBy) => {
  const totalGross = payrollData.reduce((sum, item) => sum + item.gross, 0);
  const totalDeductions = payrollData.reduce((sum, item) => 
    sum + item.unpaidDeduction + item.pfEmployee + item.professionalTax + item.otherDeductions, 0);
  const totalNet = payrollData.reduce((sum, item) => sum + item.net, 0);

  const payrun = await prisma.payrun.create({
    data: {
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      status: 'FINALIZED',
      createdBy,
      totalGross: Math.round(totalGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100
    }
  });

  const payrunLines = await Promise.all(
    payrollData.map(data => 
      prisma.payrunLine.create({
        data: {
          payrunId: payrun.id,
          employeeId: data.employeeId,
          gross: data.gross,
          unpaidDeduction: data.unpaidDeduction,
          pfEmployee: data.pfEmployee,
          professionalTax: data.professionalTax,
          otherDeductions: data.otherDeductions,
          net: data.net,
          remarks: `Working Days: ${data.workingDays}, Unpaid Days: ${data.unpaidDays}`
        }
      })
    )
  );

  return { payrun, payrunLines };
};

module.exports = {
  computePayroll,
  finalizePayroll,
  calculateWorkingDays,
  calculateUnpaidDays
};