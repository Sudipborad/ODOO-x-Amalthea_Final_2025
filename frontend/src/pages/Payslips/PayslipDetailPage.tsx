import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { formatDate, formatCurrency } from "../../utils/format";

const getPayslip = async (id: number) => {
  const response = await fetch(`/api/payslips/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch payslip');
  return response.json();
};

const downloadPayslip = async (id: number) => {
  const response = await fetch(`/api/payslips/${id}/download`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to download payslip');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payslip_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const PayslipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payslip, loading, error } = useFetch(() => getPayslip(Number(id)), [id]);

  const handleDownload = async () => {
    try {
      await downloadPayslip(Number(id));
    } catch (error) {
      console.error('Download failed:', error);
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
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading payslip: {error || 'Payslip not found'}</p>
        </div>
      </div>
    );
  }

  const employee = payslip.payrunLine?.employee;
  const payrun = payslip.payrunLine?.payrun;
  const payrunLine = payslip.payrunLine;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/payslips')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Payslips
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payslip Details</h1>
          <p className="text-gray-600">
            {employee?.user?.name} - {payrun ? formatDate(payrun.periodStart) : ''} to {payrun ? formatDate(payrun.periodEnd) : ''}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900">{employee?.user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{employee?.user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="text-gray-900">{employee?.employeeId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Department</label>
              <p className="text-gray-900">{employee?.department || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Position</label>
              <p className="text-gray-900">{employee?.position || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Pay Period Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Period Start</label>
              <p className="text-gray-900">{payrun ? formatDate(payrun.periodStart) : 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Period End</label>
              <p className="text-gray-900">{payrun ? formatDate(payrun.periodEnd) : 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Generated Date</label>
              <p className="text-gray-900">{formatDate(payslip.generatedAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {payrun?.status || 'Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Gross Pay</span>
              <span className="text-gray-900 font-semibold">{formatCurrency(payrunLine?.gross || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Total Deductions</span>
              <span className="text-red-600 font-semibold">
                -{formatCurrency((payrunLine?.professionalTax || 0) + (payrunLine?.pfEmployee || 0))}
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-900">Net Pay</span>
              <span className="font-bold text-green-600">{formatCurrency(payrunLine?.net || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.basic || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">House Rent Allowance</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.hra || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Other Allowances</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.otherAllowances || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.overtime || 0)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">Total Earnings</span>
              <span className="text-green-600">{formatCurrency(payrunLine?.gross || 0)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Professional Tax</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.professionalTax || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PF Employee Contribution</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.pfEmployee || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Income Tax</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.incomeTax || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Other Deductions</span>
              <span className="text-gray-900 font-medium">{formatCurrency(payrunLine?.otherDeductions || 0)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">Total Deductions</span>
              <span className="text-red-600">
                {formatCurrency((payrunLine?.professionalTax || 0) + (payrunLine?.pfEmployee || 0) + (payrunLine?.incomeTax || 0) + (payrunLine?.otherDeductions || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Working Days</label>
            <p className="text-gray-900 font-medium">{payrunLine?.workingDays || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Present Days</label>
            <p className="text-gray-900 font-medium">{payrunLine?.presentDays || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Leave Days</label>
            <p className="text-gray-900 font-medium">{payrunLine?.leaveDays || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">PF Employer</label>
            <p className="text-gray-900 font-medium">{formatCurrency(payrunLine?.pfEmployer || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};