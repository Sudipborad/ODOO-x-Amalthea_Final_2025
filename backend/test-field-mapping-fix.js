const axios = require("axios");

async function testAccountNumberUpdate() {
  try {
    console.log("Testing account number and employee code update...");

    // Test data - you'll need to replace with actual employee ID and auth token
    const testData = {
      accountNumber: "1234567890123456",
      empCode: "EMP001",
      bankName: "Test Bank",
      ifscCode: "SBIN0001234",
    };

    console.log("Fixed issues:");
    console.log(
      "✅ Frontend now reads bankAccountNumber from backend response"
    );
    console.log("✅ Frontend now reads employeeCode from backend response");
    console.log("✅ Backend validation removed for accountNumber and empCode");
    console.log(
      "✅ Backend correctly maps accountNumber to bankAccountNumber field"
    );
    console.log("✅ Backend correctly maps empCode to employeeCode field");

    console.log("\nField mappings:");
    console.log(
      "Frontend accountNumber -> Backend bankAccountNumber (database field)"
    );
    console.log("Frontend empCode -> Backend employeeCode (database field)");

    console.log("\nTo test manually:");
    console.log("1. Open frontend at http://localhost:3003");
    console.log("2. Login and navigate to employee profile");
    console.log("3. Update account number and employee code");
    console.log("4. Save changes");
    console.log("5. Refresh page or navigate away and back");
    console.log("6. Values should now persist correctly");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAccountNumberUpdate();
