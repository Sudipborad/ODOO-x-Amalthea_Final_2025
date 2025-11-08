const prisma = require('../config/prisma');

const getCompanySettings = async (req, res) => {
  try {
    const { companyId } = req.user;
    
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get departments
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    // Get user roles count
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: { companyId },
      _count: { id: true }
    });

    res.json({
      company,
      departments,
      roleStats: roleStats.map(stat => ({
        role: stat.role,
        count: stat._count.id
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCompanyInfo = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { name, email, phone } = req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name, email, phone }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'COMPANY_INFO_UPDATED',
        details: `Company information updated: ${name}`
      }
    });

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const department = await prisma.department.create({
      data: { name }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'DEPARTMENT_ADDED',
        details: `Department added: ${name}`
      }
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has employees
    const employeeCount = await prisma.employee.count({
      where: { department: { equals: id } }
    });

    if (employeeCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with existing employees' 
      });
    }

    await prisma.department.delete({
      where: { id: parseInt(id) }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'DEPARTMENT_DELETED',
        details: `Department deleted: ID ${id}`
      }
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSystemSettings = async (req, res) => {
  try {
    // Get audit logs
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    // Get system statistics
    const stats = {
      totalUsers: await prisma.user.count(),
      totalEmployees: await prisma.employee.count(),
      totalAttendanceRecords: await prisma.attendance.count(),
      totalPayruns: await prisma.payrun.count()
    };

    res.json({
      auditLogs,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanyInfo,
  addDepartment,
  deleteDepartment,
  getSystemSettings
};