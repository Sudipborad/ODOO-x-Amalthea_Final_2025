const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

const getPayslips = async (req, res) => {
  try {
    const { page = 1, limit = 10, employeeId } = req.query;
    const { role, employeeId: userEmployeeId } = req.user;
    
    const skip = (page - 1) * limit;
    const whereClause = {};

    // Role-based filtering
    if (role === 'EMPLOYEE') {
      whereClause.payrunLine = {
        employeeId: userEmployeeId
      };
    } else if (employeeId) {
      whereClause.payrunLine = {
        employeeId: parseInt(employeeId)
      };
    }

    const payslips = await prisma.payslip.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        payrunLine: {
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
            payrun: {
              select: {
                periodStart: true,
                periodEnd: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    const total = await prisma.payslip.count({ where: whereClause });

    res.json({
      payslips,
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

const getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId: userEmployeeId } = req.user;
    
    const payslip = await prisma.payslip.findUnique({
      where: { id: parseInt(id) },
      include: {
        payrunLine: {
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
            payrun: {
              select: {
                periodStart: true,
                periodEnd: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    // Check permissions
    const canViewAll = ['ADMIN', 'PAYROLL'].includes(role);
    const isOwnPayslip = payslip.payrunLine.employeeId === userEmployeeId;
    
    if (!canViewAll && !isOwnPayslip) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payslip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId: userEmployeeId } = req.user;
    
    const payslip = await prisma.payslip.findUnique({
      where: { id: parseInt(id) },
      include: {
        payrunLine: {
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
      }
    });

    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    // Check permissions
    const canViewAll = ['ADMIN', 'PAYROLL'].includes(role);
    const isOwnPayslip = payslip.payrunLine.employeeId === userEmployeeId;
    
    if (!canViewAll && !isOwnPayslip) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    const filePath = path.resolve(payslip.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Payslip file not found' });
    }

    // Security check - ensure file is within payslips directory
    const payslipsDir = path.resolve(process.cwd(), 'data', 'payslips');
    if (!filePath.startsWith(payslipsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileName = `payslip_${payslip.payrunLine.employee.user.name.replace(/\s+/g, '_')}_${payslip.id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });

    // Log the download
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'PAYSLIP_DOWNLOADED',
        details: `Downloaded payslip ${payslip.id} for ${payslip.payrunLine.employee.user.name}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const regeneratePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payslip = await prisma.payslip.findUnique({
      where: { id: parseInt(id) },
      include: {
        payrunLine: {
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

    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    // Delete old file if exists
    if (fs.existsSync(payslip.filePath)) {
      fs.unlinkSync(payslip.filePath);
    }

    // Generate new payslip
    const { generatePayslipPDF } = require('../services/payslip.service');
    const newFilePath = await generatePayslipPDF(payslip.payrunLine, payslip.payrunLine.employee);

    // Update payslip record
    const updatedPayslip = await prisma.payslip.update({
      where: { id: parseInt(id) },
      data: {
        filePath: newFilePath,
        generatedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: 'PAYSLIP_REGENERATED',
        details: `Regenerated payslip ${payslip.id} for ${payslip.payrunLine.employee.user.name}`
      }
    });

    res.json({
      message: 'Payslip regenerated successfully',
      payslip: updatedPayslip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPayslips,
  getPayslip,
  downloadPayslip,
  regeneratePayslip
};