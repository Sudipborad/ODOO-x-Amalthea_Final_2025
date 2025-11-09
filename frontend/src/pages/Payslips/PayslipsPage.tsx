import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { useFetch } from "../../hooks/useFetch";
import { getPayslips, downloadPayslip } from "../../api/apiAdapter";
import { useAuth } from "../../context/AuthContext";
import { formatDate, formatCurrency } from "../../utils/format";
import { canAccessPayroll } from "../../utils/roleUtils";

export const PayslipsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDownload = async (payslipId: number) => {
    try {
      const blob = await downloadPayslip(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip_${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Only fetch payslips for the current user if they're an employee
  const employeeId = canAccessPayroll(user?.role || "EMPLOYEE")
    ? undefined
    : user?.id;
  const {
    data: payslipsData,
    loading,
    error,
  } = useFetch(() => getPayslips(employeeId), [employeeId]);

  const payslips = Array.isArray(payslipsData)
    ? payslipsData.map((p: any) => ({
        id: p.id,
        employeeName: p.payrunLine?.employee?.user?.name || "Unknown",
        payPeriod: p.payrunLine?.payrun
          ? `${new Date(p.payrunLine.payrun.periodStart).toLocaleDateString(
              "en-US",
              { month: "short", year: "numeric" }
            )}`
          : "-",
        payDate:
          p.generatedAt ||
          p.payrunLine?.payrun?.periodEnd ||
          new Date().toISOString().split("T")[0],
        grossPay: p.payrunLine?.gross || 0,
        deductions: {
          tax: p.payrunLine?.professionalTax || 0,
          insurance: 0,
          retirement: p.payrunLine?.pfEmployee || 0,
        },
        netPay: p.payrunLine?.net || 0,
      }))
    : [];

  const columns = [
    { key: "employeeName", header: "Employee" },
    { key: "payPeriod", header: "Pay Period" },
    {
      key: "payDate",
      header: "Pay Date",
      render: (value: string) => formatDate(value),
    },
    {
      key: "grossPay",
      header: "Gross Pay",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "deductions",
      header: "Deductions",
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
    {
      key: "actions",
      header: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/payslips/${row.id}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => handleDownload(row.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Download
          </button>
        </div>
      ),
    },
  ];

  // Filter columns based on user role
  const filteredColumns = canAccessPayroll(user?.role || "EMPLOYEE")
    ? columns
    : columns.filter((col) => col.key !== "employeeName");

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading payslips: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600">
            {canAccessPayroll(user?.role || "EMPLOYEE")
              ? "View and manage employee payslips"
              : "View your payslip history"}
          </p>
        </div>
      </div>

      {/* Summary Cards - Only for employees viewing their own payslips */}
      {!canAccessPayroll(user?.role || "EMPLOYEE") &&
        payslips &&
        payslips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Payslips
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payslips.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Latest Net Pay
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(payslips[0]?.netPay || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    YTD Earnings
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      payslips.reduce((sum, slip) => sum + slip.netPay, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Payslips Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {canAccessPayroll(user?.role || "EMPLOYEE")
                ? "All Payslips"
                : "My Payslips"}
            </h2>
            {canAccessPayroll(user?.role || "EMPLOYEE") && (
              <button className="btn-primary">Generate Payslips</button>
            )}
          </div>
        </div>

        <div className="p-6">
          {payslips && payslips.length > 0 ? (
            <Table data={payslips} columns={filteredColumns} />
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Payslips Found
              </h3>
              <p className="text-gray-600">
                No payslips available for the selected period.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
