const prisma = require('../config/prisma');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOC files are allowed for resume'));
      }
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const getEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        manager: {
          include: { user: true }
        },
        skills: true,
        certifications: true,
        payrunLines: {
          include: {
            payrun: true
          },
          orderBy: {
            payrun: {
              periodStart: 'desc'
            }
          },
          take: 12 // Last 12 months
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dateOfBirth,
      address,
      gender,
      nationality,
      maritalStatus,
      phone,
      alternatePhone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      aadharNumber,
      panNumber
    } = req.body;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        gender,
        nationality,
        maritalStatus,
        phone,
        alternatePhone,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        aadharNumber,
        panNumber
      },
      include: {
        user: true
      }
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBankDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bankAccountNumber,
      bankName,
      ifscCode,
      accountHolderName,
      accountType
    } = req.body;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        bankAccountNumber,
        bankName,
        ifscCode,
        accountHolderName,
        accountType
      },
      include: {
        user: true
      }
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        resumePath: req.file.path
      }
    });

    res.json({ 
      message: 'Resume uploaded successfully',
      resumePath: employee.resumePath 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, proficiency } = req.body;

    const skill = await prisma.skill.create({
      data: {
        employeeId: parseInt(id),
        name,
        proficiency
      }
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    await prisma.skill.delete({
      where: { id: parseInt(skillId) }
    });

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, issueDate, validityDate } = req.body;

    const certification = await prisma.certification.create({
      data: {
        employeeId: parseInt(id),
        name,
        issueDate: new Date(issueDate),
        validityDate: validityDate ? new Date(validityDate) : null
      }
    });

    res.status(201).json(certification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeCertification = async (req, res) => {
  try {
    const { certId } = req.params;

    await prisma.certification.delete({
      where: { id: parseInt(certId) }
    });

    res.json({ message: 'Certification removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSalaryInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        payrunLines: {
          include: {
            payrun: true,
            payslip: true
          },
          orderBy: {
            payrun: {
              periodStart: 'desc'
            }
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const salaryInfo = {
      monthWage: employee.baseSalary,
      yearlyWage: employee.baseSalary * 12,
      allowances: employee.allowances,
      payrunLines: employee.payrunLines
    };

    res.json(salaryInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEmployeeProfile,
  updatePersonalInfo,
  updateBankDetails,
  uploadResume: [upload.single('resume'), uploadResume],
  addSkill,
  removeSkill,
  addCertification,
  removeCertification,
  getSalaryInfo
};