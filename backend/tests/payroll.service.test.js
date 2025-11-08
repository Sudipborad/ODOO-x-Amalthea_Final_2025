const { computePayroll, calculateWorkingDays } = require('../src/services/payroll.service');

// Mock Prisma
jest.mock('../src/config/prisma', () => ({
  employee: {
    findMany: jest.fn()
  },
  timeOff: {
    findMany: jest.fn()
  },
  attendance: {
    findMany: jest.fn()
  }
}));

const prisma = require('../src/config/prisma');

describe('Payroll Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateWorkingDays', () => {
    test('should calculate working days excluding weekends', () => {
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-05'); // Friday
      
      const workingDays = calculateWorkingDays(startDate, endDate);
      expect(workingDays).toBe(5);
    });

    test('should exclude weekends from calculation', () => {
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-07'); // Sunday
      
      const workingDays = calculateWorkingDays(startDate, endDate);
      expect(workingDays).toBe(5); // Mon-Fri only
    });
  });

  describe('computePayroll', () => {
    test('should compute payroll for full month with no unpaid days', async () => {
      const mockEmployees = [{
        id: 1,
        baseSalary: 50000,
        allowances: 5000,
        pfApplicable: true,
        professionalTaxApplicable: true,
        joinDate: new Date('2024-01-01'),
        user: { name: 'John Doe' },
        employeeCode: 'EMP001',
        department: 'IT',
        designation: 'Developer'
      }];

      prisma.employee.findMany.mockResolvedValue(mockEmployees);
      prisma.timeOff.findMany.mockResolvedValue([]);
      prisma.attendance.findMany.mockResolvedValue([]);

      const result = await computePayroll(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        employeeId: 1,
        name: 'John Doe',
        gross: 55000,
        unpaidDeduction: 0,
        pfEmployee: 6000,
        professionalTax: 200,
        otherDeductions: 0,
        net: 48800
      });
    });

    test('should apply unpaid leave deduction', async () => {
      const mockEmployees = [{
        id: 1,
        baseSalary: 50000,
        allowances: 5000,
        pfApplicable: true,
        professionalTaxApplicable: true,
        joinDate: new Date('2024-01-01'),
        user: { name: 'John Doe' },
        employeeCode: 'EMP001',
        department: 'IT',
        designation: 'Developer'
      }];

      const mockTimeOff = [{
        employeeId: 1,
        status: 'APPROVED',
        type: 'UNPAID',
        fromDate: new Date('2024-01-15'),
        toDate: new Date('2024-01-16')
      }];

      prisma.employee.findMany.mockResolvedValue(mockEmployees);
      prisma.timeOff.findMany.mockResolvedValue(mockTimeOff);
      prisma.attendance.findMany.mockResolvedValue([]);

      const result = await computePayroll(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result[0].unpaidDeduction).toBeGreaterThan(0);
      expect(result[0].net).toBeLessThan(48800);
    });

    test('should handle pro-rata calculation for mid-month joiners', async () => {
      const mockEmployees = [{
        id: 1,
        baseSalary: 50000,
        allowances: 5000,
        pfApplicable: true,
        professionalTaxApplicable: true,
        joinDate: new Date('2024-01-16'), // Joined mid-month
        user: { name: 'John Doe' },
        employeeCode: 'EMP001',
        department: 'IT',
        designation: 'Developer'
      }];

      prisma.employee.findMany.mockResolvedValue(mockEmployees);
      prisma.timeOff.findMany.mockResolvedValue([]);
      prisma.attendance.findMany.mockResolvedValue([]);

      const result = await computePayroll(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result[0].workingDays).toBeLessThan(22);
    });
  });
});