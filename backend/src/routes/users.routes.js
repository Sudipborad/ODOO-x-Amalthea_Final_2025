const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const {
  createEmployee,
  inviteEmployee,
  getUsers,
  getUser,
  updateUser,
  verifyEmployee,
  createEmployeeValidation,
  inviteEmployeeValidation,
} = require("../controllers/userController");

router.post(
  "/create",
  authenticateToken,
  requireRole(["ADMIN"]),
  createEmployeeValidation,
  createEmployee
);
router.post(
  "/invite",
  authenticateToken,
  requireRole(["ADMIN"]),
  inviteEmployeeValidation,
  inviteEmployee
);
router.get("/", authenticateToken, requireRole(["ADMIN", "HR"]), getUsers);
router.get("/:id", authenticateToken, requireRole(["ADMIN", "HR"]), getUser);
router.put("/:id", authenticateToken, requireRole(["ADMIN"]), updateUser);
router.post(
  "/:id/verify",
  authenticateToken,
  requireRole(["ADMIN"]),
  verifyEmployee
);

module.exports = router;
