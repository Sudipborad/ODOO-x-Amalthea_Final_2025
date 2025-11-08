import React, { useState } from "react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Notification } from "../../components/ui/Notification";
import { useFetch } from "../../hooks/useFetch";
import {
  getTimeOffRequests,
  submitTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  TimeOffRequest,
} from "../../api/apiAdapter";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";
import { canManageTimeOff } from "../../utils/roleUtils";

export const TimeOffPage: React.FC = () => {
  const { user } = useAuth();
  const {
    data: requests,
    loading,
    error,
    refetch,
  } = useFetch<TimeOffRequest[]>(getTimeOffRequests);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(
    null
  );
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

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

  const handleSubmitRequest = async () => {
    if (
      !formData.type ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const days =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      await submitTimeOffRequest({
        employeeId: user?.employeeId || user?.id || 0,
        employeeName: user?.name || "",
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason,
      });

      showNotification("Time off request submitted successfully!", "success");
      setShowRequestModal(false);
      setFormData({ type: "", startDate: "", endDate: "", reason: "" });
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        "Failed to submit request";
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionRequest = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      if (actionType === "approve") {
        await approveTimeOffRequest(selectedRequest.id);
        showNotification("Request approved successfully!", "success");
      } else {
        await rejectTimeOffRequest(selectedRequest.id);
        showNotification("Request rejected successfully!", "success");
      }

      setShowActionModal(false);
      setSelectedRequest(null);
      refetch();
    } catch (error) {
      showNotification(`Failed to ${actionType} request`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionModal = (
    request: TimeOffRequest,
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
  };

  // Transform backend data to match frontend expectations
  const transformedRequests =
    requests?.map((request: any) => {
      const fromDate = request.fromDate || request.startDate;
      const toDate = request.toDate || request.endDate;

      // Calculate days
      let days = request.days;
      if (!days && fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        days =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
      }

      return {
        ...request,
        id: request.id,
        employeeId: request.employeeId || request.employee?.id,
        employeeName:
          request.employee?.user?.name || request.employeeName || "Unknown",
        type: request.type || "",
        startDate: fromDate,
        endDate: toDate,
        days: days || 0,
        reason: request.reason || "",
        status: (request.status || "").toLowerCase(),
        submittedDate: request.createdAt || request.submittedDate,
      };
    }) || [];

  const columns = [
    {
      key: "employeeName",
      header: "Employee",
      render: (value: any, row: any) => {
        return row.employee?.user?.name || value || "Unknown";
      },
    },
    {
      key: "type",
      header: "Type",
      render: (value: string) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      },
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (value: string, row: any) => {
        const date = value || row.fromDate;
        if (!date) return "-";
        try {
          return formatDate(date);
        } catch (e) {
          return "Invalid Date";
        }
      },
    },
    {
      key: "endDate",
      header: "End Date",
      render: (value: string, row: any) => {
        const date = value || row.toDate;
        if (!date) return "-";
        try {
          return formatDate(date);
        } catch (e) {
          return "Invalid Date";
        }
      },
    },
    {
      key: "days",
      header: "Days",
      render: (value: number, row: any) => {
        if (value) return value;
        // Calculate days if not provided
        const fromDate = row.fromDate || row.startDate;
        const toDate = row.toDate || row.endDate;
        if (fromDate && toDate) {
          try {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            const days =
              Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
              ) + 1;
            return days;
          } catch (e) {
            return "-";
          }
        }
        return "-";
      },
    },
    { key: "reason", header: "Reason" },
    {
      key: "status",
      header: "Status",
      render: (value: string, row: any) => {
        const status = (value || row.status || "").toUpperCase();
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status || "PENDING"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (value: any, row: any) => {
        const status = (row.status || "").toUpperCase();
        return canManageTimeOff(user?.role || "EMPLOYEE") &&
          status === "PENDING" ? (
          <div className="flex space-x-2">
            <button
              onClick={() => openActionModal(row, "approve")}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => openActionModal(row, "reject")}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Reject
            </button>
          </div>
        ) : null;
      },
    },
  ];

  // Filter requests based on user role
  // Backend already filters for employees, but we do an additional client-side filter for safety
  const userEmployeeId =
    (user as any)?.employee?.id || (user as any)?.employeeId;

  const filteredRequests = canManageTimeOff(user?.role || "EMPLOYEE")
    ? transformedRequests
    : transformedRequests.filter((request) => {
        const requestEmployeeId = request.employeeId || request.employee?.id;
        // Convert both to numbers for comparison to handle type mismatches
        const matches = Number(requestEmployeeId) === Number(userEmployeeId);
        return matches;
      });

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
          <p className="text-red-800">
            Error loading time off requests: {error}
          </p>
        </div>
      </div>
    );
  }

  const isManager = canManageTimeOff(user?.role || "EMPLOYEE");

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {isManager ? "Reject & Approve Sections" : "My Time Off Requests"}
            </h1>
            <div className="flex items-center space-x-4">
              {!isManager && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  NEW
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {isManager && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Note</h3>
                <p className="text-sm text-yellow-700">
                  Employees can view only their own time off records, while
                  Admins and HR Officers can view time off records &
                  approve/reject them for all employees.
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {filteredRequests && filteredRequests.length > 0 ? (
              <Table data={filteredRequests} columns={columns} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No time off requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Time Off Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Time Off"
        onConfirm={handleSubmitRequest}
        confirmText={isSubmitting ? "Submitting..." : "Submit Request"}
        confirmButtonClass="btn-primary"
      >
        <div className="space-y-4">
          <FormField
            label="Type"
            type="select"
            value={formData.type}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
            options={[
              { value: "ANNUAL", label: "Annual Leave" },
              { value: "SICK", label: "Sick Leave" },
              { value: "CASUAL", label: "Casual Leave" },
              { value: "UNPAID", label: "Unpaid Leave" },
              { value: "MATERNITY", label: "Maternity Leave" },
              { value: "PATERNITY", label: "Paternity Leave" },
            ]}
            required
          />
          <FormField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, startDate: value }))
            }
            required
          />
          <FormField
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, endDate: value }))
            }
            required
          />
          <FormField
            label="Reason"
            type="textarea"
            value={formData.reason}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, reason: value }))
            }
            placeholder="Please provide a reason for your time off request"
            required
          />
        </div>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${
          actionType === "approve" ? "Approve" : "Reject"
        } Time Off Request`}
        onConfirm={handleActionRequest}
        confirmText={
          isSubmitting
            ? "Processing..."
            : actionType === "approve"
            ? "Approve"
            : "Reject"
        }
        confirmButtonClass={
          actionType === "approve" ? "btn-success" : "btn-danger"
        }
      >
        <p>
          Are you sure you want to {actionType} the time off request from{" "}
          <strong>
            {selectedRequest?.employeeName ||
              selectedRequest?.employee?.user?.name ||
              "Unknown"}
          </strong>{" "}
          for{" "}
          <strong>
            {selectedRequest?.days ||
              (selectedRequest?.fromDate && selectedRequest?.toDate
                ? Math.ceil(
                    (new Date(selectedRequest.toDate).getTime() -
                      new Date(selectedRequest.fromDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1
                : 0)}{" "}
            day(s)
          </strong>
          ?
        </p>
      </Modal>

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
