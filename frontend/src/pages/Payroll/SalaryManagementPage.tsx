import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, User, Building, Briefcase, Calculator, Save, Search } from "lucide-react";
import { FormField } from "../../components/ui/FormField";
import { useFetch } from "../../hooks/useFetch";
import { getAllEmployees, updateEmployeeProfile } from "../../api/apiAdapter";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [deductions, setDeductions] = useState<
    {
      name: string;
      rate: number;
      baseComponent: string;
      amount: number;
    }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch employees from API
  const { data: employeesData, loading: employeesLoading } =
    useFetch(getAllEmployees);

  const allEmployees: Employee[] = employeesData
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

  const employees = allEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    
    // Also recalculate deductions
    setDeductions(getDefaultDeductions(monthlyWage));
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

  const handleSaveConfiguration = async () => {
    if (!selectedEmployee) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await updateEmployeeProfile(parseInt(selectedEmployee.id), {
        baseSalary: editableWage.monthly,
        allowances: totalEarnings - editableWage.monthly
      });
      
      setSaveMessage({ type: 'success', text: 'Salary configuration saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save configuration' });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedEmployee) {
      const monthlyWage = selectedEmployee.monthlyWage;
      setEditableWage({ monthly: monthlyWage, yearly: monthlyWage * 12 });
      setSalaryComponents(getDefaultSalaryComponents(monthlyWage));
      setDeductions(getDefaultDeductions(monthlyWage));
      setSaveMessage(null);
    }
  };

  const getDefaultSalaryComponents = (monthlyWage: number): SalaryComponent[] => {
    return [
      {
        id: 'basic',
        name: 'Basic Salary',
        type: 'percentage',
        value: 50,
        amount: (monthlyWage * 50) / 100
      },
      {
        id: 'hra',
        name: 'House Rent Allowance',
        type: 'percentage',
        value: 40,
        baseComponent: 'Basic Salary',
        amount: ((monthlyWage * 50) / 100 * 40) / 100
      },
      {
        id: 'transport',
        name: 'Transport Allowance',
        type: 'fixed',
        value: 2000,
        amount: 2000
      },
      {
        id: 'medical',
        name: 'Medical Allowance',
        type: 'fixed',
        value: 1500,
        amount: 1500
      },
      {
        id: 'special',
        name: 'Special Allowance',
        type: 'percentage',
        value: 10,
        amount: (monthlyWage * 10) / 100
      }
    ];
  };

  const getDefaultDeductions = (monthlyWage: number) => {
    const basicSalary = (monthlyWage * 50) / 100;
    return [
      {
        name: 'Provident Fund (Employee)',
        rate: 12,
        baseComponent: 'Basic Salary',
        amount: (basicSalary * 12) / 100
      },
      {
        name: 'Professional Tax',
        rate: 0,
        baseComponent: 'Gross Salary',
        amount: 200
      },
      {
        name: 'Income Tax (TDS)',
        rate: 10,
        baseComponent: 'Gross Salary',
        amount: (monthlyWage * 10) / 100
      }
    ];
  };

  useEffect(() => {
    if (selectedEmployee) {
      const monthlyWage = selectedEmployee.monthlyWage;
      setEditableWage({
        monthly: monthlyWage,
        yearly: monthlyWage * 12,
      });

      // Auto-populate standard salary components
      setSalaryComponents(getDefaultSalaryComponents(monthlyWage));
      setDeductions(getDefaultDeductions(monthlyWage));
    }
  }, [selectedEmployee]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Salary Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure salary components and wage structures for your employees
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Select Employee</h2>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                {employeesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading employees...
                    </p>
                  </div>
                ) : employees.length > 0 ? (
                  <>
                    {searchTerm && (
                      <div className="text-sm text-gray-600 mb-2">
                        Found {employees.length} employee{employees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    {employees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedEmployee?.id === employee.id
                          ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <span>{employee.employeeId}</span>
                            <span>•</span>
                            <span>{employee.position}</span>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            ₹{employee.monthlyWage.toLocaleString()}/month
                          </div>
                        </div>
                      </div>
                    </button>
                    ))}
                  </>
                ) : searchTerm ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No employees found matching "{searchTerm}".</p>
                  </div>
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                      <p className="text-gray-600">{selectedEmployee.employeeId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-semibold text-gray-900">{selectedEmployee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-semibold text-gray-900">{selectedEmployee.position}</p>
                      </div>
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Salary Components</h2>
                    </div>
                    <button
                      onClick={addComponent}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Component</span>
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
                            className="flex items-center justify-center w-10 h-10 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Earnings:</span>
                      <span className="font-bold text-2xl text-green-600">
                        ₹{totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">-</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Deductions</h2>
                  </div>
                  <div className="space-y-3">
                    {deductions.map((deduction, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{deduction.name}</span>
                          {deduction.rate > 0 && (
                            <span className="text-sm text-gray-600 ml-2">
                              ({deduction.rate}% of {deduction.baseComponent})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-red-600 text-lg">
                          -₹{deduction.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Deductions:</span>
                      <span className="font-bold text-2xl text-red-600">
                        -₹{totalDeductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-xl p-8 text-white">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <DollarSign className="w-8 h-8" />
                      <h2 className="text-2xl font-bold">Net Salary</h2>
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      ₹{netSalary.toLocaleString()}
                    </div>
                    <p className="text-blue-100 text-lg">
                      Monthly take-home salary after all deductions
                    </p>
                  </div>
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div className={`p-4 rounded-lg border ${
                    saveMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {saveMessage.text}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={handleReset}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSaveConfiguration}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
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
