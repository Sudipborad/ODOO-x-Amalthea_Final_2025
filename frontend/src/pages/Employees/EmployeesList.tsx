import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import {
  getEmployees,
  Employee,
  getAttendance,
  createEmployee,
} from "../../api/apiAdapter";

const verifyEmployee = async (id: number) => {
  const response = await axiosClient.post(`/users/${id}/verify`);
  return response.data;
};

// Add getUsers function using axiosClient
import axiosClient from "../../api/axiosClient";

const getUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};
import { AddEmployeeForm } from "./AddEmployeeForm";
import { useAuth } from "../../context/AuthContext";
import { canAccessEmployees } from "../../utils/roleUtils";

export const EmployeesList: React.FC = () => {
  const { user } = useAuth();
  const {
    data: employees,
    loading,
    error,
    refetch,
  } = useFetch<Employee[]>(getUsers);

  // Get today's date for attendance query (using local date to avoid timezone issues)
  const getTodayDate = () => {
    const today = new Date();
    // Use local date components to avoid timezone conversion issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    data: attendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useFetch(() => {
    const todayStr = getTodayDate();
    // Query from today to today to get only today's attendance
    return getAttendance({ from: todayStr, to: todayStr, limit: 1000 });
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const getEmployeeStatus = (employee: Employee) => {
    // Check if employee has an employee record
    const employeeId = (employee as any).employee?.id;

    if (!employeeId) {
      return "absent";
    }

    // Check if attendance data is loaded
    if (
      !attendance ||
      !attendance.attendance ||
      !Array.isArray(attendance.attendance)
    ) {
      return "absent";
    }

    // Get today's date using local date components (to avoid timezone issues)
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
    const todayDay = String(today.getDate()).padStart(2, "0");
    const todayDateString = `${todayYear}-${todayMonth}-${todayDay}`;

    // Find today's attendance record for this employee
    const todayAttendance = attendance.attendance.find((record: any) => {
      if (!record || !record.employeeId) return false;

      // Match employee ID - ensure both are numbers for comparison
      const employeeIdNum = Number(employeeId);
      const recordEmployeeIdNum = Number(record.employeeId);

      if (employeeIdNum !== recordEmployeeIdNum) return false;

      // Compare dates properly - handle different date formats and timezones
      if (!record.date) return false;

      let recordDate: Date;
      try {
        recordDate = new Date(record.date);
        // Check if date is valid
        if (isNaN(recordDate.getTime())) return false;
      } catch (e) {
        return false;
      }

      // Get date string in YYYY-MM-DD format using local date components
      // This ensures we compare dates correctly regardless of timezone
      const recordYear = recordDate.getFullYear();
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, "0");
      const recordDay = String(recordDate.getDate()).padStart(2, "0");
      const recordDateString = `${recordYear}-${recordMonth}-${recordDay}`;

      // Compare date strings
      return recordDateString === todayDateString;
    });

    // If no attendance record found or no check-in, return absent
    if (!todayAttendance || !todayAttendance.checkIn) {
      return "absent";
    }

    // If checked out, show time_over
    if (todayAttendance.checkOut) {
      return "time_over";
    }

    // If checked in but not checked out yet, show green
    return "checked_in";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked_in":
        return "bg-green-500"; // Checked in but not out yet
      case "time_over":
        return "bg-yellow-500"; // Checked out (time over)
      case "completed":
        return "bg-yellow-500"; // Completed (checked out)
      case "absent":
        return "bg-yellow-500"; // Not checked in
      default:
        return "bg-yellow-500";
    }
  };

  const filteredEmployees = Array.isArray(employees)
    ? employees.filter((emp) => {
        // Filter out ADMIN users
        if (emp.role === "ADMIN") return false;

        // Apply search filter
        return (
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading employees: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          {canAccessEmployees(user?.role || "EMPLOYEE") && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              NEW
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          // Only calculate status if attendance data is loaded
          const status = attendanceLoading
            ? "absent"
            : getEmployeeStatus(employee);

          return (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                    {!employee.isVerified && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Pending Setup
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                ></div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>{employee.email}</p>
                <p>
                  Status:{" "}
                  {employee.isVerified
                    ? "Active"
                    : "Awaiting Profile Completion"}
                </p>
                {status === "checked_in" && (
                  <p className="text-green-600 font-medium">✓ Checked In</p>
                )}
                {status === "time_over" && (
                  <p className="text-yellow-600 font-medium">Time Over</p>
                )}
                {status === "absent" && (
                  <p className="text-gray-500">Not Checked In</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Link
                  to={`/employees/${employee.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
                {user?.role === "ADMIN" && !employee.isVerified && (
                  <button
                    onClick={async () => {
                      try {
                        await verifyEmployee(employee.id);
                        refetch();
                      } catch (error) {
                        console.error("Failed to verify employee:", error);
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}

      <AddEmployeeForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={async (employeeData) => {
          try {
            console.log("Creating employee with data:", employeeData);
            const result = await createEmployee(employeeData);
            console.log("Employee created successfully:", result);
            await refetch();
          } catch (error) {
            console.error("Failed to create employee:", error);
            throw error;
          }
        }}
      />
    </div>
  );
};
