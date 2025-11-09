import React, { useState } from "react";
import { Clock, User, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { getEmployeeAuditLogs } from "../../api/apiAdapter";

interface AuditLog {
  id: number;
  userId: number | null;
  role: string | null;
  action: string;
  details: string | null;
  timestamp: string;
}

interface EmployeeAuditLogsProps {
  employeeId: number;
}

export const EmployeeAuditLogs: React.FC<EmployeeAuditLogsProps> = ({
  employeeId,
}) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const {
    data: auditData,
    loading,
    error,
    refetch,
  } = useFetch(
    () => getEmployeeAuditLogs(employeeId, page, limit),
    [employeeId, page, limit]
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "EMPLOYEE_CREATED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "EMPLOYEE_UPDATED":
      case "EMPLOYEE_PROFILE_UPDATED":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "LOGIN":
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "EMPLOYEE_CREATED":
        return "bg-green-50 border-green-200";
      case "EMPLOYEE_UPDATED":
      case "EMPLOYEE_PROFILE_UPDATED":
        return "bg-blue-50 border-blue-200";
      case "LOGIN":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading audit logs: {error}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const auditLogs = auditData?.auditLogs || [];
  const employee = auditData?.employee;
  const pagination = auditData?.pagination;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Change History
            </h3>
            {employee && (
              <p className="text-sm text-gray-600">
                All changes for {employee.name} ({employee.employeeCode})
              </p>
            )}
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="p-6">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Changes Found
            </h3>
            <p className="text-gray-600">
              No audit logs available for this employee.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log: AuditLog) => (
              <div
                key={log.id}
                className={`border rounded-lg p-4 ${getActionColor(
                  log.action
                )}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {log.action.replace(/_/g, " ")}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-700 mt-1">
                        {log.details}
                      </p>
                    )}
                    {log.role && (
                      <p className="text-xs text-gray-500 mt-2">
                        Performed by: {log.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} changes
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded-md">
                    {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
