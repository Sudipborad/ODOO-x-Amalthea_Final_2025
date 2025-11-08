const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const {
  createTimeOffRequest,
  getTimeOffRequests,
  approveTimeOff,
  rejectTimeOff,
  createTimeOffValidation,
  getTimeOffValidation,
} = require("../controllers/timeoffController");

router.post(
  "/",
  authenticateToken,
  requireRole(["EMPLOYEE"]),
  createTimeOffValidation,
  createTimeOffRequest
);
router.get("/", authenticateToken, getTimeOffValidation, getTimeOffRequests);
router.put(
  "/:id/approve",
  authenticateToken,
  requireRole(["ADMIN", "HR", "PAYROLL"]),
  approveTimeOff
);
router.put(
  "/:id/reject",
  authenticateToken,
  requireRole(["ADMIN", "HR", "PAYROLL"]),
  rejectTimeOff
);

module.exports = router;
