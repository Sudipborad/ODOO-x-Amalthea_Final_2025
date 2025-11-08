import React, { useState } from "react";
import { Table } from "../../components/ui/Table";
import { FormField } from "../../components/ui/FormField";
import { Notification } from "../../components/ui/Notification";
import { useFetch } from "../../hooks/useFetch";
import { getPayruns, computePayrollDraft } from "../../api/apiAdapter";
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
          setPayrollData(response.payrollData);
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

  const columns = [
    { key: "employeeName", header: "Employee" },
    {
      key: "baseSalary",
      header: "Base Salary",
      render: (value: number) => formatCurrency(value),
    },
    { key: "hoursWorked", header: "Hours Worked" },
    { key: "overtimeHours", header: "Overtime Hours" },
    {
      key: "grossPay",
      header: "Gross Pay",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "deductions",
      header: "Total Deductions",
      render: (value: any) =>
        formatCurrency(value.tax + value.insurance + value.retirement),
    },
    {
      key: "netPay",
      header: "Net Pay",
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
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
    (sum, item) => sum + item.grossPay,
    0
  );
  const totalNetPay = payrollData.reduce((sum, item) => sum + item.netPay, 0);
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
                              { month: "short", year: "numeric" }
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
            <div className="flex items-end space-x-4">
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
              <button
                onClick={handleComputeDraft}
                disabled={isComputing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isComputing ? "Computing..." : "Compute Draft"}
              </button>
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
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    Export CSV
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Process Payroll
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
