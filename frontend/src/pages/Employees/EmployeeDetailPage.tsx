import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FormField } from "../../components/ui/FormField";
import { EmployeeAuditLogs } from "../../components/ui/EmployeeAuditLogs";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  joinDate: string;
  salary: number;
  status: "Active" | "Inactive";
  avatar?: string;
}

import { getEmployee } from "../../api/apiAdapter";

const getEmployeeById = async (id: string) => {
  return await getEmployee(parseInt(id));
};

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const {
    data: employee,
    loading,
    error,
  } = useFetch(() => getEmployeeById(id!));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "attendance", label: "Attendance" },
    { id: "timeoff", label: "Time Off" },
    { id: "payroll", label: "Payroll" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Settings" },
    ...(user?.role === "ADMIN" || user?.role === "HR"
      ? [{ id: "audit", label: "Change History" }]
      : []),
  ];

  const salaryComponents: {
    name: string;
    amount: number;
    percentage: number;
  }[] = [
    { name: "Basic Salary", amount: 37500, percentage: 50 },
    { name: "House Rent Allowance", amount: 15000, percentage: 20 },
    { name: "Transport Allowance", amount: 3750, percentage: 5 },
    { name: "Performance Bonus", amount: 6250, percentage: 8.33 },
    { name: "Leave Travel Allowance", amount: 6250, percentage: 8.33 },
    { name: "Medical Allowance", amount: 6250, percentage: 8.33 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/employees"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Employees
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 text-2xl font-bold">
                    {employee.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{employee.user?.name || employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.user?.role || employee.role}</p>
                <p className="text-xs text-gray-500">
                  ID: {employee.employeeCode || employee.id || "Not assigned"}
                </p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Tab Content Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "profile" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          label="Full Name"
                          value={employee.user?.name || employee.name || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Email"
                          type="email"
                          value={employee.user?.email || employee.email || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Phone"
                          value={employee.phone || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Personal Email"
                          value={employee.personalEmail || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Date of Birth"
                          type="date"
                          value={
                            employee.dateOfBirth
                              ? new Date(employee.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={() => {}}
                        />
                        <FormField
                          label="Blood Group"
                          value={employee.bloodGroup || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Marital Status"
                          value={employee.maritalStatus || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Emergency Contact Name"
                          value={employee.emergencyContactName || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Emergency Contact Phone"
                          value={employee.emergencyContactPhone || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Current Address"
                          type="textarea"
                          value={employee.address || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Permanent Address"
                          type="textarea"
                          value={employee.permanentAddress || "Not provided"}
                          onChange={() => {}}
                        />
                      </div>
                    </div>

                    {/* Employment Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Employment Details
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          label="Employee ID"
                          value={employee.employeeCode || employee.id || "Not assigned"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Department"
                          value={employee.department || "Not assigned"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Designation"
                          value={employee.designation || "Not assigned"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Join Date"
                          type="date"
                          value={
                            employee.joinDate
                              ? new Date(employee.joinDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={() => {}}
                        />
                        <FormField
                          label="Status"
                          value="Active"
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "payroll" && (
                  <div className="space-y-6">
                    {/* Salary Information */}
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold mb-4 text-blue-900">
                        Important
                      </h3>
                      <p className="text-blue-800 text-sm mb-4">
                        The Salary Information tab allows users to define and
                        manage all salary-related details for an employee,
                        including base salary, overtime schedules, bonus
                        structures, and other compensation components. This
                        information is specifically linked to the default wage.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Wage Types:</strong>
                        </p>
                        <p>
                          <strong>Fixed wage:</strong>
                        </p>
                        <p>
                          <strong>Salary Components:</strong>
                        </p>
                        <p>
                          Section where users can define salary structure
                          components.
                        </p>
                        <p>
                          <strong>
                            Basic Salary, House Rent Allowance, Transport
                            Allowance, Performance Bonus, Leave Travel
                            Allowance, Overtime Allowance
                          </strong>
                        </p>
                        <p>
                          <strong>Compensation Type:</strong> Fixed Amount or
                          Percentage of wage.
                        </p>
                        <p>
                          <strong>Value:</strong> Percentage field such as 50%
                          for Basic, 20% of Basic for HRA, Transport Allowance -
                          5%, Performance Bonus 8.33%, Leave Travel Allowance
                          8.33%, Fixed Allowance is a monetary value of the
                          component.
                        </p>
                        <p>
                          The total of all components should not exceed the
                          defined wage.
                        </p>
                        <p>
                          <strong>Automatic Calculation:</strong>
                        </p>
                        <p>
                          The system should calculate each component amount
                          based on the employee's defined wage.
                        </p>
                        <p>
                          <strong>Example:</strong>
                        </p>
                        <p>
                          If wage = 750,000 and Basic = 50% of wage, then Basic
                          = 375,000.
                        </p>
                        <p>If HRA = 20% of Basic, then HRA = 75,000.</p>
                        <p>
                          Base Fields for configuration (e.g. PF rate 12%) and
                          Professional Tax 200
                        </p>
                      </div>
                    </div>

                    {/* Salary Components Table */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Salary Components
                        </h3>
                        <p className="text-sm text-gray-600">
                          Salary Info tab Should only be visible to
                          Admin/Payroll Officer
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Monthly Wage:</strong> ₹
                              {employee.baseSalary
                                ? Math.round(
                                    employee.baseSalary / 12
                                  ).toLocaleString()
                                : "Not set"}
                            </p>
                            <p>
                              <strong>Yearly Wage:</strong> ₹
                              {employee.baseSalary
                                ? employee.baseSalary.toLocaleString()
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Pay Period:</strong> Monthly
                            </p>
                            <p>
                              <strong>Bank:</strong>{" "}
                              {employee.bankName || "Not provided"} -{" "}
                              {employee.bankBranch || "Not provided"}
                            </p>
                            <p>
                              <strong>Account:</strong>{" "}
                              {employee.bankAccountNumber || employee.accountNumber ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Component
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount (₹)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Percentage (%)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {salaryComponents.map((component, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {component.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{component.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {component.percentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Deductions
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
                          <div>
                            <p>
                              <strong>Provident Fund (PF) Contribution:</strong>{" "}
                              ₹9,000 (12% of Basic)
                            </p>
                            <p>
                              <strong>Professional Tax:</strong> ₹200
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Income Tax:</strong> As per slab
                            </p>
                            <p>
                              <strong>Other Deductions:</strong> ₹0
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <EmployeeAuditLogs employeeId={parseInt(id!)} />
                )}

                {activeTab !== "profile" &&
                  activeTab !== "payroll" &&
                  activeTab !== "audit" && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {tabs.find((t) => t.id === activeTab)?.label}
                      </h3>
                      <p className="text-gray-600">
                        This section is under development.
                      </p>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
