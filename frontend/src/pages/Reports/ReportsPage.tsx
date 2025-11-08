import React, { useState } from "react";
import { FormField } from "../../components/ui/FormField";

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const reportTypes: { value: string; label: string }[] = [];

  const handleGenerateReport = () => {
    // Mock report generation
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Generation */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Generate Report
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <FormField
                      label="Report Type"
                      type="select"
                      value={selectedReport}
                      onChange={setSelectedReport}
                      options={reportTypes}
                      placeholder="Select report type"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Start Date"
                        type="date"
                        value={dateRange.start}
                        onChange={(value) =>
                          setDateRange((prev) => ({ ...prev, start: value }))
                        }
                      />
                      <FormField
                        label="End Date"
                        type="date"
                        value={dateRange.end}
                        onChange={(value) =>
                          setDateRange((prev) => ({ ...prev, end: value }))
                        }
                      />
                    </div>

                    <button
                      onClick={handleGenerateReport}
                      disabled={!selectedReport}
                      className="btn-primary disabled:opacity-50"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Quick Stats
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Employees
                    </span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Active This Month
                    </span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg. Attendance
                    </span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Pending Requests
                    </span>
                    <span className="font-semibold">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Generation */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Salary Statement Report
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Year</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium">
                  Print
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Salary Statement Report Print
              </h2>
              <div className="border border-gray-300 rounded p-4 bg-gray-50 min-h-96">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">[Company]</h3>
                  <p className="text-sm text-red-600">
                    Salary Statement Report
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p>
                      <strong>Employee Name:</strong>
                    </p>
                    <p>
                      <strong>Designation:</strong>
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Date Of Joining:</strong>
                    </p>
                    <p>
                      <strong>Salary Effective From:</strong>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Earnings</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <strong>Salary Components</strong>
                    </div>
                    <div>
                      <strong>Monthly Amount</strong>
                    </div>
                    <div>
                      <strong>Yearly Amount</strong>
                    </div>
                    <div>Basic</div>
                    <div>-</div>
                    <div>-</div>
                    <div>HRA</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-red-600">Deduction</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>PF...</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                    <div>Net Salary</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
