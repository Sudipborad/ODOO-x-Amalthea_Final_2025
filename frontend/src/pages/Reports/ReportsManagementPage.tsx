import React, { useState } from "react";
import { FormField } from "../../components/ui/FormField";

interface Report {
  id: string;
  name: string;
  type: "Attendance" | "Payroll" | "Employee" | "Leave" | "Performance";
  description: string;
  lastGenerated: string;
  status: "Ready" | "Generating" | "Failed";
}

export const ReportsManagementPage: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const availableReports: Report[] = [];

  const reportTemplates: { value: string; label: string }[] = [];

  const departments = [{ value: "", label: "All Departments" }];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800";
      case "Generating":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Attendance":
        return "bg-blue-100 text-blue-800";
      case "Payroll":
        return "bg-purple-100 text-purple-800";
      case "Employee":
        return "bg-green-100 text-green-800";
      case "Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Performance":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateReport = () => {
    // Generate report logic here
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports Management
          </h1>
          <p className="text-gray-600">
            Generate and manage organizational reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Generate New Report
            </h2>

            <div className="space-y-4">
              <FormField
                label="Report Type"
                type="select"
                value={selectedReportType}
                onChange={setSelectedReportType}
                options={reportTemplates}
                placeholder="Select report type"
              />

              <FormField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(value) =>
                  setDateRange((prev) => ({ ...prev, startDate: value }))
                }
              />

              <FormField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(value) =>
                  setDateRange((prev) => ({ ...prev, endDate: value }))
                }
              />

              <FormField
                label="Department"
                type="select"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departments}
              />

              <button
                onClick={handleGenerateReport}
                disabled={!selectedReportType}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Generate Report
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Quick Reports
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors">
                  Today's Attendance
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors">
                  This Month's Payroll
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors">
                  Pending Leave Requests
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Reports
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {report.name}
                          </h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                              report.type
                            )}`}
                          >
                            {report.type}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last generated: {report.lastGenerated}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {report.status === "Ready" && (
                          <>
                            <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                              Download
                            </button>
                            <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
                              View
                            </button>
                          </>
                        )}
                        {report.status === "Generating" && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            <span className="text-sm text-yellow-600">
                              Generating...
                            </span>
                          </div>
                        )}
                        {report.status === "Failed" && (
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Report Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Total Reports Generated
              </span>
              <span className="text-sm font-medium text-gray-900">247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium text-gray-900">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Most Popular</span>
              <span className="text-sm font-medium text-gray-900">
                Attendance
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Scheduled Reports
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Monthly Payroll
                </p>
                <p className="text-xs text-gray-500">Every 1st of month</p>
              </div>
              <span className="text-xs text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Weekly Attendance
                </p>
                <p className="text-xs text-gray-500">Every Monday</p>
              </div>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export Options
          </h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200">
              📊 Excel (.xlsx)
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200">
              📄 PDF (.pdf)
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200">
              📋 CSV (.csv)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
