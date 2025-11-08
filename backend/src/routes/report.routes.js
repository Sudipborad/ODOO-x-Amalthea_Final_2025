const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const {
  getPayrollReport,
  getAttendanceReport,
  getAuditLogs,
  getDashboardStats,
  payrollReportValidation,
  attendanceReportValidation,
} = require("../controllers/reportController");

router.get(
  "/payroll",
  authenticateToken,
  requireRole("ADMIN", "PAYROLL"),
  payrollReportValidation,
  getPayrollReport
);
router.get(
  "/attendance",
  authenticateToken,
  requireRole("ADMIN", "HR", "PAYROLL"),
  attendanceReportValidation,
  getAttendanceReport
);
router.get(
  "/audit",
  authenticateToken,
  requireRole(["ADMIN", "PAYROLL", "HR"]),
  getAuditLogs
);
router.get(
  "/dashboard",
  authenticateToken,
  requireRole("ADMIN", "HR", "PAYROLL"),
  getDashboardStats
);

module.exports = router;
