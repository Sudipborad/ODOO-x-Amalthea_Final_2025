import React, { useState, useEffect } from "react";
import { FormField } from "../../components/ui/FormField";
import { useFetch } from "../../hooks/useFetch";
import { getAllEmployees } from "../../api/apiAdapter";

interface SalaryComponent {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  baseComponent?: string;
  amount: number;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  monthlyWage: number;
  yearlyWage: number;
}

export const SalaryManagementPage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [editableWage, setEditableWage] = useState({ monthly: 0, yearly: 0 });
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(
    []
  );

  // Fetch employees from API
  const { data: employeesData, loading: employeesLoading } =
    useFetch(getAllEmployees);

  const employees: Employee[] = employeesData
    ? employeesData.map((emp: any) => ({
        id: emp.id.toString(),
        name: emp.user?.name || "Unknown",
        employeeId: emp.employeeCode || `EMP${emp.id}`,
        department: emp.department || "Unknown",
        position: emp.designation || "Unknown",
        monthlyWage: emp.baseSalary || 0,
        yearlyWage: (emp.baseSalary || 0) * 12,
      }))
    : [];

  const [deductions, setDeductions] = useState<
    {
      name: string;
      rate: number;
      baseComponent: string;
      amount: number;
    }[]
  >([]);

  const totalEarnings = salaryComponents.reduce(
    (sum, comp) => sum + comp.amount,
    0
  );
  const totalDeductions = deductions.reduce((sum, ded) => sum + ded.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const addComponent = () => {
    const newComponent: SalaryComponent = {
      id: Date.now().toString(),
      name: "",
      type: "fixed",
      value: 0,
      amount: 0,
    };
    setSalaryComponents([...salaryComponents, newComponent]);
  };

  const calculateComponentAmount = (
    component: SalaryComponent,
    monthlyWage: number,
    components: SalaryComponent[]
  ) => {
    if (component.type === "percentage") {
      if (component.baseComponent === "Basic Salary") {
        const basicComp = components.find((c) => c.name === "Basic Salary");
        const basicAmount = basicComp
          ? basicComp.type === "percentage"
            ? (monthlyWage * basicComp.value) / 100
            : basicComp.value
          : 0;
        return (basicAmount * component.value) / 100;
      }
      return (monthlyWage * component.value) / 100;
    }
    return component.value;
  };

  const recalculateAllComponents = (monthlyWage: number) => {
    setSalaryComponents((prev) =>
      prev.map((comp) => ({
        ...comp,
        amount: calculateComponentAmount(comp, monthlyWage, prev),
      }))
    );
  };

  const updateComponent = (
    id: string,
    field: keyof SalaryComponent,
    value: any
  ) => {
    setSalaryComponents((prev) => {
      const updated = prev.map((comp) =>
        comp.id === id ? { ...comp, [field]: value } : comp
      );
      return updated.map((comp) => ({
        ...comp,
        amount: calculateComponentAmount(comp, editableWage.monthly, updated),
      }));
    });
  };

  const removeComponent = (id: string) => {
    setSalaryComponents((prev) => prev.filter((comp) => comp.id !== id));
  };

  useEffect(() => {
    if (selectedEmployee) {
      setEditableWage({
        monthly: selectedEmployee.monthlyWage,
        yearly: selectedEmployee.yearlyWage,
      });

      // Clear components and deductions when selecting a new employee
      setSalaryComponents([]);
      setDeductions([]);
    }
  }, [selectedEmployee]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Salary Management
          </h1>
          <p className="text-gray-600">
            Configure salary components and wage structures
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
              <div className="space-y-2">
                {employeesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading employees...
                    </p>
                  </div>
                ) : employees.length > 0 ? (
                  employees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedEmployee?.id === employee.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-600">
                        {employee.employeeId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.position}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No employees found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Salary Configuration */}
          <div className="lg:col-span-2">
            {selectedEmployee ? (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Employee Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium">
                        {selectedEmployee.employeeId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">
                        {selectedEmployee.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                  </div>
                </div>

                {/* Wage Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Wage Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Monthly Wage (₹)"
                      type="number"
                      value={editableWage.monthly.toString()}
                      onChange={(value) => {
                        const monthly = parseFloat(value) || 0;
                        setEditableWage({ monthly, yearly: monthly * 12 });
                        recalculateAllComponents(monthly);
                      }}
                    />
                    <FormField
                      label="Yearly Wage (₹)"
                      type="number"
                      value={editableWage.yearly.toString()}
                      onChange={(value) => {
                        const yearly = parseFloat(value) || 0;
                        const monthly = yearly / 12;
                        setEditableWage({ monthly, yearly });
                        recalculateAllComponents(monthly);
                      }}
                    />
                  </div>
                </div>

                {/* Salary Components */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Salary Components</h2>
                    <button
                      onClick={addComponent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Component
                    </button>
                  </div>

                  <div className="space-y-4">
                    {salaryComponents.map((component) => (
                      <div
                        key={component.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <FormField
                            label="Component Name"
                            value={component.name}
                            onChange={(value) =>
                              updateComponent(component.id, "name", value)
                            }
                            placeholder="e.g., Basic Salary"
                          />
                          <FormField
                            label="Type"
                            type="select"
                            value={component.type}
                            onChange={(value) =>
                              updateComponent(component.id, "type", value)
                            }
                            options={[
                              { value: "fixed", label: "Fixed Amount" },
                              { value: "percentage", label: "Percentage" },
                            ]}
                          />
                          <FormField
                            label={
                              component.type === "percentage"
                                ? "Percentage (%)"
                                : "Amount (₹)"
                            }
                            type="number"
                            value={component.value.toString()}
                            onChange={(value) =>
                              updateComponent(
                                component.id,
                                "value",
                                parseFloat(value) || 0
                              )
                            }
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Calculated Amount (₹)
                            </label>
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              ₹{component.amount.toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => removeComponent(component.id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Earnings:</span>
                      <span className="font-bold text-green-600">
                        ₹{totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Deductions</h2>
                  <div className="space-y-3">
                    {deductions.map((deduction, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <span className="font-medium">{deduction.name}</span>
                          {deduction.rate > 0 && (
                            <span className="text-sm text-gray-600 ml-2">
                              ({deduction.rate}% of {deduction.baseComponent})
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-red-600">
                          -₹{deduction.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Deductions:</span>
                      <span className="font-bold text-red-600">
                        -₹{totalDeductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold mb-2">Net Salary</h2>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{netSalary.toLocaleString()}
                    </div>
                    <p className="text-gray-600 mt-2">
                      Monthly take-home salary after all deductions
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Employee
                </h2>
                <p className="text-gray-600">
                  Choose an employee from the list to configure their salary
                  structure.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
