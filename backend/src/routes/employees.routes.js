const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeProfile,
  getEmployeeAuditLogs,
  createEmployeeValidation,
  updateEmployeeValidation,
  updateEmployeeProfileValidation,
} = require("../controllers/employeeController");

router.get("/", authenticateToken, getEmployees);
router.get(
  "/me/dashboard",
  authenticateToken,
  require("../controllers/employeeDashboardController").getEmployeePersonalData
);
router.get("/:id", authenticateToken, getEmployee);
router.post(
  "/",
  authenticateToken,
  requireRole(["ADMIN", "HR"]),
  createEmployeeValidation,
  createEmployee
);
router.put(
  "/:id",
  authenticateToken,
  requireRole(["ADMIN", "HR"]),
  updateEmployeeValidation,
  updateEmployee
);

// Enhanced profile update endpoint with comprehensive employee details
router.put(
  "/:id/profile",
  authenticateToken,
  updateEmployeeProfileValidation,
  updateEmployeeProfile
);

// Get audit logs for a specific employee (Admin/HR only)
router.get(
  "/:id/audit-logs",
  authenticateToken,
  requireRole(["ADMIN", "HR"]),
  getEmployeeAuditLogs
);

module.exports = router;
