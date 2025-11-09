const axios = require("axios");

async function testProfileUpdate() {
  try {
    // Simulate the login to get token
    const loginResponse = await axios.post(
      "http://localhost:3001/api/auth/login",
      {
        email: "demo@gmail.com",
        password: "password123",
      }
    );

    const token = loginResponse.data.token;
    console.log("Login successful, token received");

    // Test profile update with the same data frontend is sending
    const updateData = {
      department: "General",
      designation: "Employee",
      baseSalary: 0,
      joinDate: "2025-11-09T01:34:06.322Z",
      residingAddress: "af",
      nationality: "Indian",
      personalEmail: "sudipborad1@gmail.com",
      gender: "Male",
      maritalStatus: "Single",
      bankName: "Test Bank",
      accountNumber: "1234567890123",
      ifscCode: "TEST0001234",
      panNumber: "ABCDE1234F",
      empCode: "EMP001",
    };

    console.log("Sending update data:", updateData);

    const updateResponse = await axios.put(
      "http://localhost:3001/api/employees/54/profile",
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Update successful:", updateResponse.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.log("Validation errors:", error.response.data.errors);
    }
  }
}

testProfileUpdate();
