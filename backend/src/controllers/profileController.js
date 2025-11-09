const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const generateUserId = (firstName, lastName, companyCode = "OI") => {
  const year = new Date().getFullYear();
  const firstNameCode = firstName.substring(0, 2).toUpperCase();
  const lastNameCode = lastName.substring(0, 2).toUpperCase();
  const serialNumber = String(Date.now()).slice(-4);
  return `${companyCode}${firstNameCode}${lastNameCode}${year}${serialNumber}`;
};

const completeProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phone,
      address,
      department,
      designation,
      bankAccount,
      newPassword,
    } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Profile already completed" });
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[nameParts.length - 1] || "";
    const finalUserId = generateUserId(firstName, lastName);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password and ID
    await prisma.user.update({
      where: { id: userId },
      data: {
        userId: finalUserId,
        name,
        password: hashedPassword,
        isVerified: false, // Admin must verify after reviewing profile
      },
    });

    // Create employee record with all details
    await prisma.employee.create({
      data: {
        userId: userId,
        employeeCode: finalUserId,
        department,
        designation,
        baseSalary: 30000, // Default salary - admin can update
        allowances: 0,
        pfApplicable: true,
        professionalTaxApplicable: true,
        joinDate: new Date(),
        bankAccountMasked: `****${bankAccount}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        role: user.role,
        action: "PROFILE_COMPLETED",
        details: `User ${user.email} completed profile with ID: ${finalUserId}`,
      },
    });

    res.json({
      message: "Profile completed successfully",
      userId: finalUserId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, designation } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: "Complete profile first" });
    }

    // Update user name
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    // Update employee details if exists
    if (user.employee) {
      await prisma.employee.update({
        where: { id: user.employee.id },
        data: {
          department: department || user.employee.department,
          designation: designation || user.employee.designation,
        },
      });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeProfileValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("phone")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Valid phone number required"),
  body("address")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Address must be at least 5 characters"),
  body("department")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Department required"),
  body("designation")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Designation required"),
  body("bankAccount")
    .isLength({ min: 4, max: 4 })
    .withMessage("Bank account must be 4 digits"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

module.exports = {
  completeProfile,
  updateProfile,
  getProfile,
  completeProfileValidation,
};
