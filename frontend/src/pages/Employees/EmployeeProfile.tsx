import React from "react";
import { useParams, Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import {
  getEmployee,
  Employee,
  updateEmployeeProfile,
} from "../../api/apiAdapter";
import { formatDate, formatCurrency } from "../../utils/format";
import { EnhancedEmployeeProfile } from "../../components/ui/EnhancedEmployeeProfile";
import { TabbedEmployeeProfile } from "../../components/ui/TabbedEmployeeProfile";
import { useAuth } from "../../context/AuthContext";

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const employeeId = parseInt(id || "0");

  const {
    data: employee,
    loading,
    error,
    refetch,
  } = useFetch<Employee>(() => getEmployee(employeeId), [employeeId]);

  const handleUpdateEmployee = async (updatedData: Partial<Employee>) => {
    try {
      await updateEmployeeProfile(employeeId, updatedData);
      refetch();
    } catch (error) {
      console.error("Error updating employee profile:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading employee: {error || "Employee not found"}
          </p>
        </div>
      </div>
    );
  }

  // Check if user can edit (HR, Admin, or the employee themselves)
  const canEdit =
    user?.role === "ADMIN" || user?.role === "HR" || user?.id === employee.id;

  // Transform employee data to match TabbedEmployeeProfile interface
  const employeeProfileData = {
    id: employee.id,
    user: {
      name: employee.name,
      email: employee.email,
      role: employee.role,
    },
    department: employee.department,
    designation: employee.position, // Map position to designation
    joinDate: employee.hireDate, // Map hireDate to joinDate
    baseSalary: employee.salary, // Map salary to baseSalary
    residingAddress: employee.address || "",
    // Add default values for new fields
    dateOfBirth: "",
    nationality: "",
    personalEmail: "",
    gender: "",
    maritalStatus: "",
    panNumber: "",
    uanNumber: "",
    empCode: employee.id.toString(),
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/employees"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
        >
          ← Back to Employees
        </Link>
      </div>

      <TabbedEmployeeProfile
        employee={employeeProfileData}
        canEdit={canEdit}
        onUpdate={handleUpdateEmployee}
      />

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <Link
          to={`/attendance?employee=${employeeId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Attendance
        </Link>
        <Link
          to={`/payslips?employee=${employeeId}`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          View Payslips
        </Link>
      </div>
    </div>
  );
};
