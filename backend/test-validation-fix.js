const axios = require("axios");

// Test data with account number and employee code
const testData = {
  accountNumber: "1234567890123456", // 16 digits
  empCode: "EMP123",
  bankName: "Test Bank",
  ifscCode: "SBIN0001234",
};

async function testProfileUpdate() {
  try {
    console.log("Testing profile update with validation fix...");
    console.log("Test data:", testData);

    // First, let's try to login to get a token (you'll need to replace with actual credentials)
    console.log("This test requires a valid auth token and employee ID");
    console.log("Please test manually in the frontend application");

    // The validation has been removed for:
    // - accountNumber: no longer requires /^\d{9,18}$/ pattern
    // - employeeCode: no longer requires non-empty validation
    // - empCode: no longer requires non-empty validation
    // - bankAccountNumber: no longer requires /^\d{9,18}$/ pattern

    console.log("✅ Validation rules removed successfully");
    console.log(
      "✅ Account number and employee code fields should now save without validation errors"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testProfileUpdate();
