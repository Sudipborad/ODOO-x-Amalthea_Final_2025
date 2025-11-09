const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:3002", "http://127.0.0.1:3002"],
    credentials: true,
  })
);

app.use(express.json());

// Start with simplified profile update endpoint for testing
app.put("/api/employees/:id/profile", (req, res) => {
  console.log("=== Profile Update Request ===");
  console.log("Employee ID:", req.params.id);
  console.log("Request Body:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", req.headers);

  // Mock validation
  const { panNumber, ifscCode, accountNumber } = req.body;

  const errors = [];

  if (panNumber && panNumber !== "") {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panPattern.test(panNumber.trim())) {
      errors.push({ path: "panNumber", msg: "Invalid PAN number format" });
    }
  }

  if (ifscCode && ifscCode !== "") {
    const ifscPattern = /^[A-Z]{4}[0-9A-Z]{7}$/i;
    if (!ifscPattern.test(ifscCode.trim())) {
      errors.push({ path: "ifscCode", msg: "Invalid IFSC code format" });
    }
  }

  if (errors.length > 0) {
    console.log("Validation errors:", errors);
    return res.status(400).json({
      error: "Validation failed",
      errors,
      details: errors.map((e) => `${e.path}: ${e.msg}`).join(", "),
    });
  }

  console.log("Profile update successful!");
  res.json({ message: "Profile updated successfully" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log("Ready to test profile updates...");
});
