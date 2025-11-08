const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');

const getEmployees = async (req, res) => {
  try {
    const { role } = req.user;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Determine what fields to include based on role
    const includesSalary = ['ADMIN', 'PAYROLL'].includes(role);
    
    const employees = await prisma.employee.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter sensitive data based on role
    const filteredEmployees = employees.map(emp => ({
      ...emp,
      baseSalary: includesSalary ? emp.baseSalary : undefined,
      allowances: includesSalary ? emp.allowances : undefined,
      bankAccountMasked: includesSalary ? emp.bankAccountMasked : undefined
    }));

    const total = await prisma.employee.count();

    res.json({
      employees: filteredEmployees,
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

const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId } = req.user;
    
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if user can view this employee
    const canViewAll = ['ADMIN', 'HR', 'PAYROLL'].includes(role);
    const isOwnRecord = employeeId === employee.id;
    
    if (!canViewAll && !isOwnRecord) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Filter sensitive data based on role
    const includesSalary = ['ADMIN', 'PAYROLL'].includes(role) || isOwnRecord;
    
    const filteredEmployee = {
      ...employee,
      baseSalary: includesSalary ? employee.baseSalary : undefined,
      allowances: includesSalary ? employee.allowances : undefined,
      bankAccountMasked: includesSalary ? employee.bankAccountMasked : undefined
    };

    res.json(filteredEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      employeeCode,
      department,
      designation,
      baseSalary,
      allowances = 0,
      pfApplicable = true,
      professionalTaxApplicable = true,
      joinDate,
      bankAccountMasked
    } = req.body;

    // Check if user exists and doesn't already have an employee record
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { userId } });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee record already exists for this user' });
    }

    const employee = await prisma.employee.create({
      data: {
        userId,
        employeeCode,
        department,
        designation,
        baseSalary,
        allowances,
        pfApplicable,
        professionalTaxApplicable,
        joinDate: new Date(joinDate),
        bankAccountMasked
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'EMPLOYEE_CREATED',
        details: `Created employee record for ${user.email}`
      }
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.joinDate) {
      updateData.joinDate = new Date(updateData.joinDate);
    }

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'EMPLOYEE_UPDATED',
        details: `Updated employee ${employee.employeeCode}`
      }
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const createEmployeeValidation = [
  body('userId').isInt().withMessage('Valid user ID required'),
  body('employeeCode').trim().isLength({ min: 1 }).withMessage('Employee code required'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department required'),
  body('designation').trim().isLength({ min: 1 }).withMessage('Designation required'),
  body('baseSalary').isFloat({ min: 0 }).withMessage('Valid base salary required'),
  body('allowances').optional().isFloat({ min: 0 }).withMessage('Valid allowances required'),
  body('joinDate').isISO8601().withMessage('Valid join date required')
];

const updateEmployeeValidation = [
  body('employeeCode').optional().trim().isLength({ min: 1 }).withMessage('Employee code required'),
  body('department').optional().trim().isLength({ min: 1 }).withMessage('Department required'),
  body('designation').optional().trim().isLength({ min: 1 }).withMessage('Designation required'),
  body('baseSalary').optional().isFloat({ min: 0 }).withMessage('Valid base salary required'),
  body('allowances').optional().isFloat({ min: 0 }).withMessage('Valid allowances required'),
  body('joinDate').optional().isISO8601().withMessage('Valid join date required')
];

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  createEmployeeValidation,
  updateEmployeeValidation
};