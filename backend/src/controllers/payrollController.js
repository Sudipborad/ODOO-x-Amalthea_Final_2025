const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { computePayroll, finalizePayroll } = require('../services/payroll.service');
const { generatePayslipsForPayrun } = require('../services/payslip.service');
const { sendPayslipNotification } = require('../services/mailer.service');

const computePayrollDraft = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { periodStart, periodEnd } = req.body;

    const payrollData = await computePayroll(new Date(periodStart), new Date(periodEnd));

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'PAYRUN_COMPUTED',
        details: `Computed payroll for period ${periodStart} to ${periodEnd}`
      }
    });

    res.json({
      periodStart,
      periodEnd,
      payrollData,
      summary: {
        totalEmployees: payrollData.length,
        totalGross: payrollData.reduce((sum, item) => sum + item.gross, 0),
        totalDeductions: payrollData.reduce((sum, item) => 
          sum + item.unpaidDeduction + item.pfEmployee + item.professionalTax + item.otherDeductions, 0),
        totalNet: payrollData.reduce((sum, item) => sum + item.net, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const finalizePayrollRun = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { periodStart, periodEnd, payrollData } = req.body;

    // If payrollData is not provided, compute it
    const finalPayrollData = payrollData || await computePayroll(new Date(periodStart), new Date(periodEnd));

    // Finalize payroll
    const { payrun, payrunLines } = await finalizePayroll(
      new Date(periodStart),
      new Date(periodEnd),
      finalPayrollData,
      req.user.id
    );

    // Generate payslips
    const payslips = await generatePayslipsForPayrun(payrun.id);

    // Send notifications to employees
    for (const payrunLine of payrunLines) {
      try {
        const employee = await prisma.employee.findUnique({
          where: { id: payrunLine.employeeId },
          include: { user: true }
        });
        
        const payslip = payslips.find(p => p.payrunLineId === payrunLine.id);
        if (employee && payslip) {
          await sendPayslipNotification(employee, payslip.id);
        }
      } catch (emailError) {
        console.error('Failed to send payslip notification:', emailError);
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'PAYRUN_FINALIZED',
        details: `Finalized payroll for period ${periodStart} to ${periodEnd}, generated ${payslips.length} payslips`
      }
    });

    res.json({
      message: 'Payroll finalized successfully',
      payrun,
      payslipsGenerated: payslips.length,
      summary: {
        totalEmployees: payrunLines.length,
        totalGross: payrun.totalGross,
        totalDeductions: payrun.totalDeductions,
        totalNet: payrun.totalNet
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayruns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const payruns = await prisma.payrun.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        payrunLines: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.payrun.count({ where: whereClause });

    res.json({
      payruns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayrun = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payrun = await prisma.payrun.findUnique({
      where: { id: parseInt(id) },
      include: {
        payrunLines: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            payslip: true
          }
        }
      }
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    res.json(payrun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePayrun = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payrun = await prisma.payrun.findUnique({
      where: { id: parseInt(id) }
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    if (payrun.status === 'FINALIZED') {
      return res.status(400).json({ error: 'Cannot delete finalized payrun' });
    }

    await prisma.payrun.delete({
      where: { id: parseInt(id) }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'PAYRUN_DELETED',
        details: `Deleted draft payrun for period ${payrun.periodStart.toDateString()} to ${payrun.periodEnd.toDateString()}`
      }
    });

    res.json({ message: 'Payrun deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const computePayrollValidation = [
  body('periodStart').isISO8601().withMessage('Valid period start date required'),
  body('periodEnd').isISO8601().withMessage('Valid period end date required')
];

const finalizePayrollValidation = [
  body('periodStart').isISO8601().withMessage('Valid period start date required'),
  body('periodEnd').isISO8601().withMessage('Valid period end date required'),
  body('payrollData').optional().isArray().withMessage('Payroll data must be an array')
];

module.exports = {
  computePayrollDraft,
  finalizePayrollRun,
  getPayruns,
  getPayrun,
  deletePayrun,
  computePayrollValidation,
  finalizePayrollValidation
};