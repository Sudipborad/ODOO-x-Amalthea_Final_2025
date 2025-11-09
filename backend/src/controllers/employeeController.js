const { body, validationResult } = require("express-validator");
const prisma = require("../config/prisma");

const getEmployees = async (req, res) => {
  try {
    const { role } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Determine what fields to include based on role
    const includesSalary = ["ADMIN", "PAYROLL"].includes(role);

    const employees = await prisma.employee.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter sensitive data based on role
    const filteredEmployees = employees.map((emp) => ({
      ...emp,
      baseSalary: includesSalary ? emp.baseSalary : undefined,
      allowances: includesSalary ? emp.allowances : undefined,
      bankAccountMasked: includesSalary ? emp.bankAccountMasked : undefined,
    }));

    const total = await prisma.employee.count();

    res.json({
      employees: filteredEmployees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
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
            role: true,
          },
        },
        skills: true,
        certifications: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if user can view this employee
    const canViewAll = ["ADMIN", "HR", "PAYROLL"].includes(role);
    const isOwnRecord = employeeId === employee.id;

    if (!canViewAll && !isOwnRecord) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Filter sensitive data based on role
    const includesSalary = ["ADMIN", "PAYROLL"].includes(role) || isOwnRecord;
    const includesBankDetails =
      ["ADMIN", "PAYROLL"].includes(role) || isOwnRecord;

    const filteredEmployee = {
      ...employee,
      baseSalary: includesSalary ? employee.baseSalary : undefined,
      allowances: includesSalary ? employee.allowances : undefined,
      // Bank details - only for authorized roles or own record
      bankAccountNumber: includesBankDetails
        ? employee.bankAccountNumber
        : undefined,
      accountNumber: includesBankDetails
        ? employee.bankAccountNumber
        : undefined,
      bankName: includesBankDetails ? employee.bankName : undefined,
      bankBranch: includesBankDetails ? employee.bankBranch : undefined,
      ifscCode: includesBankDetails ? employee.ifscCode : undefined,
      accountHolderName: includesBankDetails
        ? employee.accountHolderName
        : undefined,
      accountType: includesBankDetails ? employee.accountType : undefined,
      upiId: includesBankDetails ? employee.upiId : undefined,
      // Sensitive government IDs - only for authorized roles or own record
      aadharNumber: includesBankDetails ? employee.aadharNumber : undefined,
      panNumber: includesBankDetails ? employee.panNumber : undefined,
      passportNumber: includesBankDetails ? employee.passportNumber : undefined,
      pfNumber: includesBankDetails ? employee.pfNumber : undefined,
      uanNumber: includesBankDetails ? employee.uanNumber : undefined,
      esiNumber: includesBankDetails ? employee.esiNumber : undefined,
      empCode: employee.employeeCode,
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
      bankAccountMasked,
      // Enhanced profile fields
      dateOfBirth,
      gender,
      nationality,
      maritalStatus,
      address,
      phoneNumber,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      panNumber,
      aadharNumber,
      esiNumber,
      pfNumber,
      uanNumber,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      workLocation,
      employmentType,
      workShift,
      probationPeriod,
      noticePeriod,
      skills,
      certifications,
      bloodGroup,
      medicalConditions,
      healthInsuranceNumber,
    } = req.body;

    // Check if user exists and doesn't already have an employee record
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { userId },
    });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Employee record already exists for this user" });
    }

    // Prepare the data object with enhanced fields
    const employeeData = {
      userId,
      department,
      designation,
      baseSalary,
      allowances,
      pfApplicable,
      professionalTaxApplicable,
      joinDate: new Date(joinDate),
      // Enhanced fields
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      nationality,
      maritalStatus,
      address,
      phoneNumber,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      panNumber,
      aadharNumber,
      esiNumber,
      pfNumber,
      uanNumber,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      workLocation,
      employmentType,
      workShift,
      probationPeriod,
      noticePeriod,
      skills: skills || [],
      certifications: certifications || [],
      bloodGroup,
      medicalConditions,
      healthInsuranceNumber,
    };

    // Add legacy fields if provided
    if (employeeCode) employeeData.employeeCode = employeeCode;
    if (bankAccountMasked) employeeData.bankAccountMasked = bankAccountMasked;

    const employee = await prisma.employee.create({
      data: employeeData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: "EMPLOYEE_CREATED",
        details: `Created employee record for ${user.email}`,
      },
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
            role: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: "EMPLOYEE_UPDATED",
        details: `Updated employee ${employee.employeeCode}`,
      },
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    console.log("updateEmployeeProfile called with:", {
      params: req.params,
      body: req.body,
      user: req.user,
    });

    console.log("Specific fields being checked:");
    console.log("accountNumber:", req.body.accountNumber);
    console.log("empCode:", req.body.empCode);
    console.log("panNumber:", req.body.panNumber);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
        details: errors
          .array()
          .map((err) => `${err.path}: ${err.msg}`)
          .join(", "),
      });
    }

    const { id } = req.params;
    const { role, employeeId } = req.user;

    // Check permissions
    const canUpdateAll = ["ADMIN", "HR"].includes(role);
    const isOwnRecord = employeeId === parseInt(id);

    if (!canUpdateAll && !isOwnRecord) {
      return res.status(403).json({ error: "Access denied" });
    }

    const {
      // Personal Information
      dateOfBirth,
      address,
      permanentAddress,
      city,
      state,
      zipCode,
      country,
      gender,
      nationality,
      maritalStatus,
      phone,
      alternatePhone,
      personalEmail,

      // Emergency Contact
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      emergencyContactAddress,

      // Government IDs
      aadharNumber,
      panNumber,
      passportNumber,
      drivingLicenseNumber,
      voterIdNumber,

      // Professional Information
      workLocation,
      reportingManager,
      workType,
      probationPeriod,
      confirmationDate,
      previousCompany,
      previousDesignation,
      totalExperience,

      // Bank Details
      bankAccountNumber,
      bankName,
      bankBranch,
      ifscCode,
      accountHolderName,
      accountType,
      upiId,

      // Additional Financial
      pfNumber,
      uanNumber,
      esiNumber,

      // Health & Benefits
      bloodGroup,
      medicalConditions,
      insuranceNominee,
      insuranceNomineeRelation,

      // Skills and Certifications
      skills,
      certifications,
    } = req.body;

    // Prepare update data
    const updateData = {};

    // Handle basic profile fields
    if (req.body.department) updateData.department = req.body.department;
    if (req.body.designation) updateData.designation = req.body.designation;
    if (req.body.baseSalary)
      updateData.baseSalary = parseFloat(req.body.baseSalary);
    if (req.body.joinDate) updateData.joinDate = new Date(req.body.joinDate);

    // Handle employee code - support both empCode and employeeCode for compatibility
    if (req.body.empCode && req.body.empCode !== "") {
      console.log("Setting employee code from empCode:", req.body.empCode);
      updateData.employeeCode = req.body.empCode;
    }
    if (req.body.employeeCode && req.body.employeeCode !== "") {
      console.log(
        "Setting employee code from employeeCode:",
        req.body.employeeCode
      );
      updateData.employeeCode = req.body.employeeCode;
    }

    // Only include fields that are provided and valid
    if (dateOfBirth && dateOfBirth !== "") {
      try {
        updateData.dateOfBirth = new Date(dateOfBirth);
      } catch (e) {
        console.warn("Invalid dateOfBirth:", dateOfBirth);
      }
    }
    if (req.body.dateOfBirth && req.body.dateOfBirth !== "") {
      try {
        updateData.dateOfBirth = new Date(req.body.dateOfBirth);
      } catch (e) {
        console.warn("Invalid req.body.dateOfBirth:", req.body.dateOfBirth);
      }
    }
    if (address || req.body.residingAddress)
      updateData.address = address || req.body.residingAddress;
    if (permanentAddress) updateData.permanentAddress = permanentAddress;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (country) updateData.country = country;
    if (gender) updateData.gender = gender;
    if (nationality) updateData.nationality = nationality;
    if (maritalStatus) updateData.maritalStatus = maritalStatus;
    if (phone && phone !== "") updateData.phone = phone;
    if (alternatePhone && alternatePhone !== "")
      updateData.alternatePhone = alternatePhone;
    if (personalEmail && personalEmail !== "")
      updateData.personalEmail = personalEmail;

    if (emergencyContactName)
      updateData.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone)
      updateData.emergencyContactPhone = emergencyContactPhone;
    if (emergencyContactRelation)
      updateData.emergencyContactRelation = emergencyContactRelation;
    if (emergencyContactAddress)
      updateData.emergencyContactAddress = emergencyContactAddress;

    // Government IDs - only allow updates by admin/HR or own record
    if (canUpdateAll || isOwnRecord) {
      if (aadharNumber) updateData.aadharNumber = aadharNumber;
      if (panNumber && panNumber !== "") {
        console.log(
          "Setting PAN number:",
          panNumber,
          "Type:",
          typeof panNumber
        );
        updateData.panNumber = panNumber;
      }
      if (passportNumber) updateData.passportNumber = passportNumber;
      if (drivingLicenseNumber)
        updateData.drivingLicenseNumber = drivingLicenseNumber;
      if (voterIdNumber) updateData.voterIdNumber = voterIdNumber;
    }

    if (workLocation) updateData.workLocation = workLocation;
    if (reportingManager) updateData.reportingManager = reportingManager;
    if (workType) updateData.workType = workType;
    if (probationPeriod) updateData.probationPeriod = probationPeriod;
    if (confirmationDate)
      updateData.confirmationDate = new Date(confirmationDate);
    if (previousCompany) updateData.previousCompany = previousCompany;
    if (previousDesignation)
      updateData.previousDesignation = previousDesignation;
    if (totalExperience) updateData.totalExperience = totalExperience;

    // Bank details - only allow updates by admin/payroll or own record
    if (canUpdateAll || ["PAYROLL"].includes(role) || isOwnRecord) {
      // Handle both accountNumber and bankAccountNumber for compatibility
      if (req.body.accountNumber && req.body.accountNumber !== "") {
        console.log(
          "Setting account number from req.body.accountNumber:",
          req.body.accountNumber
        );
        updateData.bankAccountNumber = req.body.accountNumber;
      }
      if (bankAccountNumber && bankAccountNumber !== "") {
        console.log(
          "Setting account number from bankAccountNumber:",
          bankAccountNumber
        );
        updateData.bankAccountNumber = bankAccountNumber;
      }
      if (bankName) updateData.bankName = bankName;
      if (bankBranch) updateData.bankBranch = bankBranch;
      if (ifscCode && ifscCode !== "") {
        console.log("Setting IFSC code:", ifscCode, "Type:", typeof ifscCode);
        updateData.ifscCode = ifscCode;
      }
      if (accountHolderName) updateData.accountHolderName = accountHolderName;
      if (accountType) updateData.accountType = accountType;
      if (upiId) updateData.upiId = upiId;
      if (pfNumber) updateData.pfNumber = pfNumber;
      if (uanNumber) updateData.uanNumber = uanNumber;
      if (esiNumber) updateData.esiNumber = esiNumber;
    }

    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (medicalConditions) updateData.medicalConditions = medicalConditions;
    if (insuranceNominee) updateData.insuranceNominee = insuranceNominee;
    if (insuranceNomineeRelation)
      updateData.insuranceNomineeRelation = insuranceNomineeRelation;

    console.log("Final updateData being sent to database:", updateData);

    // Update employee profile
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        skills: true,
        certifications: true,
      },
    });

    // Handle skills update
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await prisma.skill.deleteMany({
        where: { employeeId: parseInt(id) },
      });

      // Create new skills
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((skill) => ({
            employeeId: parseInt(id),
            name: skill.name,
            proficiency: skill.proficiency,
          })),
        });
      }
    }

    // Handle certifications update
    if (certifications && Array.isArray(certifications)) {
      // Delete existing certifications
      await prisma.certification.deleteMany({
        where: { employeeId: parseInt(id) },
      });

      // Create new certifications
      if (certifications.length > 0) {
        await prisma.certification.createMany({
          data: certifications.map((cert) => ({
            employeeId: parseInt(id),
            name: cert.name,
            issueDate: new Date(cert.issueDate),
            validityDate: cert.validityDate
              ? new Date(cert.validityDate)
              : null,
          })),
        });
      }
    }

    // Get updated employee with skills and certifications
    const updatedEmployee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        skills: true,
        certifications: true,
      },
    });

    // Create detailed audit log for profile update
    const updatedFields = Object.keys(updateData).filter(
      (key) => updateData[key] !== undefined
    );
    const auditDetails = `Updated profile for employee ${
      updatedEmployee.employeeCode
    } (${updatedEmployee.user.name}). Fields changed: ${updatedFields.join(
      ", "
    )}`;

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        role: req.user.role,
        action: "EMPLOYEE_PROFILE_UPDATED",
        details: auditDetails,
      },
    });

    res.json({
      message: "Employee profile updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Get audit logs related to this employee
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { details: { contains: employee.employeeCode } },
          { details: { contains: employee.user.name } },
          { details: { contains: employee.user.email } },
          { userId: employee.userId }, // Actions performed by this employee
        ],
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { timestamp: "desc" },
    });

    const total = await prisma.auditLog.count({
      where: {
        OR: [
          { details: { contains: employee.employeeCode } },
          { details: { contains: employee.user.name } },
          { details: { contains: employee.user.email } },
          { userId: employee.userId },
        ],
      },
    });

    res.json({
      auditLogs,
      employee: {
        id: employee.id,
        name: employee.user.name,
        email: employee.user.email,
        employeeCode: employee.employeeCode,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation middleware
const createEmployeeValidation = [
  body("userId").isInt().withMessage("Valid user ID required"),
  body("department")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Department required"),
  body("designation")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Designation required"),
  body("baseSalary")
    .isFloat({ min: 0 })
    .withMessage("Valid base salary required"),
  body("allowances")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Valid allowances required"),
  body("joinDate").isISO8601().withMessage("Valid join date required"),
  // Enhanced profile fields (all optional)
  body("employeeCode").optional().trim().isLength({ min: 1 }),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Valid date of birth required"),
  body("phoneNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number required"),
  body("emergencyContactPhone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid emergency contact phone required"),
  body("aadharNumber")
    .optional()
    .isLength({ min: 12, max: 12 })
    .withMessage("Aadhar number must be 12 digits"),
  body("panNumber")
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN number format"),
  body("ifscCode")
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage("Invalid IFSC code format"),
  body("probationPeriod")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Valid probation period required"),
  body("noticePeriod")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Valid notice period required"),
];

const updateEmployeeProfileValidation = [
  body("dateOfBirth")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage("Valid date of birth required"),
  body("phone")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      // Allow various phone formats, at least 10 digits
      return /^\d{10,15}$/.test(value.replace(/\D/g, ""));
    })
    .withMessage("Valid phone number required"),
  body("alternatePhone")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{10,15}$/.test(value.replace(/\D/g, ""));
    })
    .withMessage("Valid alternate phone number required"),
  body("personalEmail")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .withMessage("Valid personal email required"),
  body("emergencyContactPhone")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{10,15}$/.test(value.replace(/\D/g, ""));
    })
    .withMessage("Valid emergency contact phone required"),
  body("aadharNumber")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{12}$/.test(value);
    })
    .withMessage("Aadhar number must be 12 digits"),
  body("panNumber")
    .optional()
    .custom((value) => {
      if (!value || value === "" || value === null) return true;
      // More lenient PAN validation - allow lowercase and trim spaces
      const trimmedValue = value.toString().trim().toUpperCase();
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmedValue);
    })
    .withMessage("PAN number should be 10 characters (e.g., ABCDE1234F)"),
  body("zipCode")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{5,6}$/.test(value);
    })
    .withMessage("Valid zip code required"),
  body("bankAccountNumber")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{9,18}$/.test(value.toString().replace(/\D/g, ""));
    })
    .withMessage("Valid bank account number required"),
  body("accountNumber")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^\d{9,18}$/.test(value.toString().replace(/\D/g, ""));
    })
    .withMessage("Valid account number required"),
  body("empCode")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return value.toString().trim().length > 0;
    })
    .withMessage("Valid employee code required"),
  body("employeeCode")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return value.toString().trim().length > 0;
    })
    .withMessage("Valid employee code required"),
  body("ifscCode")
    .optional()
    .custom((value) => {
      if (!value || value === "" || value === null) return true;
      // More lenient IFSC validation - at least 4 letters followed by some alphanumeric
      const trimmedValue = value.toString().trim().toUpperCase();
      return (
        /^[A-Z]{4}[0-9A-Z]{7}$/.test(trimmedValue) ||
        /^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmedValue)
      );
    })
    .withMessage("IFSC code should be 11 characters (e.g., SBIN0001234)"),
  body("upiId")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return /^[\w.-]+@[\w.-]+$/.test(value);
    })
    .withMessage("Invalid UPI ID format"),
  body("confirmationDate")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage("Valid confirmation date required"),
  body("totalExperience")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
    })
    .withMessage("Valid total experience required"),
  body("probationPeriod")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return !isNaN(parseInt(value)) && parseInt(value) >= 0;
    })
    .withMessage("Valid probation period required"),
];

const updateEmployeeValidation = [
  body("employeeCode")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Employee code required"),
  body("department")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Department required"),
  body("designation")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Designation required"),
  body("baseSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Valid base salary required"),
  body("allowances")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Valid allowances required"),
  body("joinDate")
    .optional()
    .isISO8601()
    .withMessage("Valid join date required"),
];

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeProfile,
  getEmployeeAuditLogs,
  createEmployeeValidation,
  updateEmployeeValidation,
  updateEmployeeProfileValidation,
};
