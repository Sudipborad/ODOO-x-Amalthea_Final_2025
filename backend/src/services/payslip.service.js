const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

const generatePayslipPDF = async (payrunLine, employee) => {
  const fileName = `payslip_${employee.employeeCode}_${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'data', 'payslips', fileName);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text('WorkZen HRMS', 50, 50);
  doc.fontSize(16).text('Payslip', 50, 80);
  
  // Employee Details
  doc.fontSize(12);
  doc.text(`Employee: ${employee.user.name}`, 50, 120);
  doc.text(`Employee Code: ${employee.employeeCode}`, 50, 140);
  doc.text(`Department: ${employee.department}`, 50, 160);
  doc.text(`Designation: ${employee.designation}`, 50, 180);
  
  // Payroll Period
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunLine.payrunId }
  });
  
  doc.text(`Pay Period: ${payrun.periodStart.toDateString()} - ${payrun.periodEnd.toDateString()}`, 50, 220);
  
  // Earnings
  doc.text('EARNINGS', 50, 260);
  doc.text('Basic Salary:', 50, 280);
  doc.text(`₹${employee.baseSalary.toFixed(2)}`, 200, 280);
  doc.text('Allowances:', 50, 300);
  doc.text(`₹${employee.allowances.toFixed(2)}`, 200, 300);
  doc.text('Gross Salary:', 50, 320);
  doc.text(`₹${payrunLine.gross.toFixed(2)}`, 200, 320);
  
  // Deductions
  doc.text('DEDUCTIONS', 50, 360);
  doc.text('Unpaid Leave:', 50, 380);
  doc.text(`₹${payrunLine.unpaidDeduction.toFixed(2)}`, 200, 380);
  doc.text('PF (Employee):', 50, 400);
  doc.text(`₹${payrunLine.pfEmployee.toFixed(2)}`, 200, 400);
  doc.text('Professional Tax:', 50, 420);
  doc.text(`₹${payrunLine.professionalTax.toFixed(2)}`, 200, 420);
  doc.text('Other Deductions:', 50, 440);
  doc.text(`₹${payrunLine.otherDeductions.toFixed(2)}`, 200, 440);
  
  // Net Pay
  doc.fontSize(14);
  doc.text('NET PAY:', 50, 480);
  doc.text(`₹${payrunLine.net.toFixed(2)}`, 200, 480);
  
  // Remarks
  if (payrunLine.remarks) {
    doc.fontSize(10);
    doc.text(`Remarks: ${payrunLine.remarks}`, 50, 520);
  }
  
  // Footer
  doc.fontSize(8);
  doc.text('This is a system generated payslip.', 50, 700);
  doc.text(`Generated on: ${new Date().toDateString()}`, 50, 715);
  
  doc.end();
  
  return filePath;
};

const generatePayslipsForPayrun = async (payrunId) => {
  const payrunLines = await prisma.payrunLine.findMany({
    where: { payrunId },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });

  const payslips = [];
  
  for (const payrunLine of payrunLines) {
    const filePath = await generatePayslipPDF(payrunLine, payrunLine.employee);
    
    const payslip = await prisma.payslip.create({
      data: {
        payrunLineId: payrunLine.id,
        filePath
      }
    });
    
    payslips.push(payslip);
  }
  
  return payslips;
};

module.exports = {
  generatePayslipPDF,
  generatePayslipsForPayrun
};