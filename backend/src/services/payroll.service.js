const prisma = require("../config/prisma");

const WORKING_DAYS_PER_MONTH = 22;

const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude weekends
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
      status: "APPROVED",
      type: "UNPAID",
      fromDate: { lte: periodEnd },
      toDate: { gte: periodStart },
    },
  });

  let unpaidDays = 0;
  unpaidLeaves.forEach((leave) => {
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
        lte: periodEnd,
      },
      status: "ABSENT",
    },
  });

  unpaidDays += attendanceRecords.length;
  return unpaidDays;
};

const computePayroll = async (periodStart, periodEnd) => {
  console.log("Computing payroll for period:", periodStart, "to", periodEnd);

  const employees = await prisma.employee.findMany({
    include: {
      user: true,
    },
    where: {
      joinDate: { lte: periodEnd },
      status: "ACTIVE", // Only include active employees
    },
  });

  console.log(
    `Found ${employees.length} active employees for payroll computation`
  );

  const payrollData = [];

  for (const employee of employees) {
    console.log(
      `Processing employee: ${employee.user.name} (${employee.user.email})`
    );
    console.log(
      `Base Salary: ${employee.baseSalary}, Allowances: ${employee.allowances}`
    );

    const workingDays = calculateWorkingDays(periodStart, periodEnd);
    const unpaidDays = await calculateUnpaidDays(
      employee.id,
      periodStart,
      periodEnd
    );

    // Calculate pro-rata if joined mid-period
    const joinDate = new Date(employee.joinDate);
    const actualWorkingDays =
      joinDate > periodStart
        ? calculateWorkingDays(joinDate, periodEnd)
        : workingDays;

    const gross = employee.baseSalary + (employee.allowances || 0);
    const unpaidDeduction = (employee.baseSalary / workingDays) * unpaidDays;
    const pfEmployee = employee.pfApplicable ? employee.baseSalary * 0.12 : 0;
    const professionalTax = employee.professionalTaxApplicable ? 200 : 0;
    const otherDeductions = 0; // Can be extended for loans/advances

    const net =
      Math.round(
        (gross -
          (unpaidDeduction + pfEmployee + professionalTax + otherDeductions)) *
          100
      ) / 100;

    console.log(
      `Computed for ${employee.user.name}: Gross=${gross}, Net=${net}`
    );

    payrollData.push({
      employeeId: employee.id,
      employeeName: employee.user.name, // Frontend expects 'employeeName'
      name: employee.user.name, // Keep original for compatibility
      employeeCode: employee.employeeCode,
      department: employee.department,
      designation: employee.designation,
      baseSalary: Math.round(employee.baseSalary * 100) / 100, // Frontend expects 'baseSalary'
      hoursWorked: Math.round(actualWorkingDays * 8 * 100) / 100, // Assume 8 hours per day
      overtimeHours: 0, // Can be extended later
      grossPay: Math.round(gross * 100) / 100, // Frontend expects 'grossPay'
      gross: Math.round(gross * 100) / 100, // Keep original for compatibility
      deductions: {
        // Frontend expects deductions object
        tax: Math.round(professionalTax * 100) / 100,
        insurance: 0, // Can be extended
        retirement: Math.round(pfEmployee * 100) / 100,
        unpaid: Math.round(unpaidDeduction * 100) / 100,
        other: Math.round(otherDeductions * 100) / 100,
      },
      netPay: Math.round(net * 100) / 100, // Frontend expects 'netPay'
      net: Math.round(net * 100) / 100, // Keep original for compatibility
      // Original fields for backend compatibility
      unpaidDeduction: Math.round(unpaidDeduction * 100) / 100,
      pfEmployee: Math.round(pfEmployee * 100) / 100,
      professionalTax,
      otherDeductions,
      workingDays: actualWorkingDays,
      unpaidDays,
    });
  }

  console.log(`Returning ${payrollData.length} payroll records`);

  // If no data was generated, return sample data for the first few employees
  if (payrollData.length === 0 && employees.length > 0) {
    console.log("No payroll data generated, creating sample data...");
    return employees.slice(0, 5).map((employee) => ({
      employeeId: employee.id,
      employeeName: employee.user.name,
      name: employee.user.name,
      employeeCode: employee.employeeCode,
      department: employee.department,
      designation: employee.designation,
      baseSalary: employee.baseSalary || 0,
      hoursWorked: 176, // 22 working days * 8 hours
      overtimeHours: 0,
      grossPay: (employee.baseSalary || 0) + (employee.allowances || 0),
      gross: (employee.baseSalary || 0) + (employee.allowances || 0),
      deductions: {
        tax: 200,
        insurance: 0,
        retirement: (employee.baseSalary || 0) * 0.12,
        unpaid: 0,
        other: 0,
      },
      netPay: ((employee.baseSalary || 0) + (employee.allowances || 0)) * 0.85, // Rough calculation
      net: ((employee.baseSalary || 0) + (employee.allowances || 0)) * 0.85,
      workingDays: 22,
      unpaidDays: 0,
    }));
  }

  return payrollData;
};

const finalizePayroll = async (
  periodStart,
  periodEnd,
  payrollData,
  createdBy
) => {
  const totalGross = payrollData.reduce((sum, item) => sum + item.gross, 0);
  const totalDeductions = payrollData.reduce(
    (sum, item) =>
      sum +
      item.unpaidDeduction +
      item.pfEmployee +
      item.professionalTax +
      item.otherDeductions,
    0
  );
  const totalNet = payrollData.reduce((sum, item) => sum + item.net, 0);

  const payrun = await prisma.payrun.create({
    data: {
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      status: "FINALIZED",
      createdBy,
      totalGross: Math.round(totalGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
    },
  });

  const payrunLines = await Promise.all(
    payrollData.map((data) =>
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
          remarks: `Working Days: ${data.workingDays}, Unpaid Days: ${data.unpaidDays}`,
        },
      })
    )
  );

  return { payrun, payrunLines };
};

module.exports = {
  computePayroll,
  finalizePayroll,
  calculateWorkingDays,
  calculateUnpaidDays,
};
