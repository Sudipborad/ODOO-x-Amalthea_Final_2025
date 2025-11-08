const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  createEmployeeValidation,
  updateEmployeeValidation,
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

module.exports = router;
