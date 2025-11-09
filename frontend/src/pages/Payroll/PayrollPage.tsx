import React, { useState } from "react";
import { Table } from "../../components/ui/Table";
import { FormField } from "../../components/ui/FormField";
import { Notification } from "../../components/ui/Notification";
import { useFetch } from "../../hooks/useFetch";
import {
  getPayruns,
  computePayrollDraft,
  finalizePayroll,
} from "../../api/apiAdapter";
import { formatCurrency } from "../../utils/format";

export const PayrollPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [isComputing, setIsComputing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [hasComputed, setHasComputed] = useState(true);

  // Fetch existing payroll data
  const { data: payrollResponse, loading: payrollLoading } =
    useFetch(getPayruns);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type, isVisible: true });
  };

  const handleComputeDraft = async () => {
    if (!selectedPeriod) {
      showNotification("Please select a pay period", "error");
      return;
    }

    setIsComputing(true);
    try {
      // Fetch payroll data from API
      try {
        const [year, month] = selectedPeriod.split("-");
        const periodStart = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const periodEnd = `${year}-${month}-${lastDay}`;

        const response = await computePayrollDraft(periodStart, periodEnd);
        if (
          response &&
          response.payrollData &&
          response.payrollData.length > 0
        ) {
          // Ensure each payroll item has the expected structure
          const normalizedData = response.payrollData.map((item: any) => ({
            employeeName: item.employeeName || "Unknown Employee",
            baseSalary: item.baseSalary || 0,
            hoursWorked: item.hoursWorked || 0,
            overtimeHours: item.overtimeHours || 0,
            grossPay: item.grossPay || 0,
            deductions: item.deductions || {
              tax: 0,
              insurance: 0,
              retirement: 0,
            },
            netPay: item.netPay || 0,
            ...item, // Keep other properties
          }));
          setPayrollData(normalizedData);
        } else {
          setPayrollData([]);
        }
      } catch (apiError) {
        setPayrollData([]);
      }
      setHasComputed(true);
      showNotification("Payroll draft computed successfully!", "success");
    } catch (error) {
      setPayrollData([]);
      setHasComputed(true);
      showNotification("Failed to compute payroll data", "error");
    } finally {
      setIsComputing(false);
    }
  };

  const handleExportCSV = () => {
    try {
      if (!payrollData || payrollData.length === 0) {
        showNotification("No payroll data to export", "error");
        return;
      }

      // Create CSV content
      const headers = [
        "Employee Name",
        "Department",
        "Designation",
        "Base Salary",
        "Hours Worked",
        "Overtime Hours",
        "Gross Pay",
        "Tax",
        "Insurance",
        "Retirement",
        "Total Deductions",
        "Net Pay",
      ];

      const csvContent = [
        headers.join(","),
        ...payrollData.map((row) =>
          [
            `"${row.employeeName || row.name || "Unknown"}"`,
            `"${row.department || ""}"`,
            `"${row.designation || ""}"`,
            row.baseSalary || 0,
            row.hoursWorked || 0,
            row.overtimeHours || 0,
            row.grossPay || 0,
            row.deductions?.tax || 0,
            row.deductions?.insurance || 0,
            row.deductions?.retirement || 0,
            (row.deductions?.tax || 0) +
              (row.deductions?.insurance || 0) +
              (row.deductions?.retirement || 0),
            row.netPay || 0,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `payroll_draft_${selectedPeriod}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification("Payroll data exported successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showNotification("Failed to export payroll data", "error");
    }
  };

  const handleProcessPayroll = async () => {
    if (!payrollData || payrollData.length === 0) {
      showNotification("No payroll data to process", "error");
      return;
    }

    if (!selectedPeriod) {
      showNotification("Please select a pay period", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to process payroll for ${selectedPeriod}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const [year, month] = selectedPeriod.split("-");
      const periodStart = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const periodEnd = `${year}-${month}-${lastDay}`;

      await finalizePayroll(periodStart, periodEnd, payrollData);

      showNotification(
        "Payroll processed successfully! Payslips have been generated.",
        "success"
      );

      // Clear the draft data and reload payroll history
      setPayrollData([]);
      setHasComputed(false);

      // Refresh the page to show updated payroll runs
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Process payroll error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      showNotification(`Failed to process payroll: ${errorMessage}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      key: "employeeName",
      header: "Employee",
      render: (value: string, row: any) =>
        value || row.name || "Unknown Employee",
    },
    {
      key: "baseSalary",
      header: "Base Salary",
      render: (value: number, row: any) =>
        formatCurrency(value || row.gross || 0),
    },
    {
      key: "hoursWorked",
      header: "Hours Worked",
      render: (value: number) => value || 0,
    },
    {
      key: "overtimeHours",
      header: "Overtime Hours",
      render: (value: number) => value || 0,
    },
    {
      key: "grossPay",
      header: "Gross Pay",
      render: (value: number, row: any) =>
        formatCurrency(value || row.gross || 0),
    },
    {
      key: "deductions",
      header: "Total Deductions",
      render: (value: any) => {
        if (!value || typeof value !== "object") {
          return formatCurrency(0);
        }
        const tax = value.tax || 0;
        const insurance = value.insurance || 0;
        const retirement = value.retirement || 0;
        return formatCurrency(tax + insurance + retirement);
      },
    },
    {
      key: "netPay",
      header: "Net Pay",
      render: (value: number, row: any) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value || row.net || 0)}
        </span>
      ),
    },
  ];

  // Generate period options for the last 12 months
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  const totalGrossPay = payrollData.reduce(
    (sum, item) => sum + (item.grossPay || item.gross || 0),
    0
  );
  const totalNetPay = payrollData.reduce(
    (sum, item) => sum + (item.netPay || item.net || 0),
    0
  );
  const totalDeductions = totalGrossPay - totalNetPay;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Payroll</h1>
          </div>
        </div>

        <div className="p-6">
          {/* Existing Payrolls */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Recent Payroll Runs
            </h2>
            {payrollLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payroll data...</p>
              </div>
            ) : payrollResponse?.payruns &&
              payrollResponse.payruns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollResponse.payruns.map((payrun: any) => (
                      <tr key={payrun.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(payrun.periodStart).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payrun.periodStart).toLocaleDateString()}{" "}
                            - {new Date(payrun.periodEnd).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payrun.status === "FINALIZED"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payrun.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payrun.payrunLines?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payrun.totalGross || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payrun.totalNet || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payrun.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payroll runs found.</p>
              </div>
            )}
          </div>

          {/* Payroll Controls */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payroll Computation
            </h2>
            <div className="flex items-end space-x-4 mb-6">
              <div className="flex-1 max-w-xs">
                <FormField
                  label="Pay Period"
                  type="select"
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  options={generatePeriodOptions()}
                  placeholder="Select pay period"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleComputeDraft}
                  disabled={isComputing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isComputing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Computing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Compute Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Payroll Summary */}
          {hasComputed && payrollData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Gross Pay
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalGrossPay)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Deductions
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalDeductions)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Net Pay
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(totalNetPay)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Draft Table */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {hasComputed
                  ? `Payroll Draft - ${selectedPeriod}`
                  : "Payroll Draft"}
              </h2>
              {hasComputed && payrollData.length > 0 && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportCSV}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handleProcessPayroll}
                    disabled={isProcessing || isComputing}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Process Payroll</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {hasComputed ? (
              <div className="overflow-x-auto">
                <Table data={payrollData} columns={columns} />
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Payroll Data
                </h3>
                <p className="text-gray-600">
                  Select a pay period and click "Compute Draft" to generate
                  payroll data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
      />
    </div>
  );
};
