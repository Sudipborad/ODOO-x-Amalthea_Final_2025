import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FormField } from "../../components/ui/FormField";
import { useFetch } from "../../hooks/useFetch";

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

const getEmployeeById = async (id: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch employee");
  return response.json();
};

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
  ];

  const salaryComponents: {
    name: string;
    amount: number;
    percentage: number;
  }[] = [];

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
                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.role}</p>
                <p className="text-xs text-gray-500">
                  ID: {employee.userId || "Not assigned"}
                </p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                    employee.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {employee.isVerified ? "Active" : "Pending"}
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
                          value={employee.name}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Email"
                          type="email"
                          value={employee.email}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Phone"
                          value={employee.phone || "Not provided"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Address"
                          type="textarea"
                          value="123 Main Street, City, State 12345"
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
                          value={employee.userId || "Not assigned"}
                          onChange={() => {}}
                        />
                        <FormField
                          label="Department"
                          value={
                            employee.employee?.department || "Not assigned"
                          }
                          onChange={() => {}}
                        />
                        <FormField
                          label="Designation"
                          value={
                            employee.employee?.designation || "Not assigned"
                          }
                          onChange={() => {}}
                        />
                        <FormField
                          label="Join Date"
                          type="date"
                          value={
                            employee.employee?.joinDate
                              ? new Date(employee.employee.joinDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={() => {}}
                        />
                        <FormField
                          label="Status"
                          value={
                            employee.isVerified
                              ? "Active"
                              : "Pending Verification"
                          }
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
                              {employee.employee?.baseSalary
                                ? employee.employee.baseSalary.toLocaleString()
                                : "Not set"}
                            </p>
                            <p>
                              <strong>Yearly Wage:</strong> ₹
                              {employee.employee?.baseSalary
                                ? (
                                    employee.employee.baseSalary * 12
                                  ).toLocaleString()
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Pay Period:</strong> Monthly
                            </p>
                            <p>
                              <strong>Bank Details:</strong> _______________
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

                {activeTab !== "profile" && activeTab !== "payroll" && (
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
