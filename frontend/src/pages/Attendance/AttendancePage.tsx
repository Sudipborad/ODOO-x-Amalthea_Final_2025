import React, { useState } from "react";
import { Table } from "../../components/ui/Table";
import { Notification } from "../../components/ui/Notification";
import { useFetch } from "../../hooks/useFetch";
import {
  getAttendance,
  clockIn,
  clockOut,
  getTodayAttendance,
} from "../../api/apiAdapter";
import { useAuth } from "../../context/AuthContext";
import { formatDate, formatTime } from "../../utils/format";
import { canAccessEmployees } from "../../utils/roleUtils";

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  // Get today's date for filtering
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState("");

  const {
    data: attendance,
    loading,
    error,
    refetch,
  } = useFetch(() => {
    // If a specific date is selected, use that date range
    if (selectedDate) {
      return getAttendance({ from: selectedDate, to: selectedDate, limit: 1000 });
    }
    
    // Otherwise, fetch last 30 days of attendance records
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    return getAttendance({ from: fromDate, to: toDate, limit: 1000 });
  }, [selectedDate]);

  const { data: todayAttendance, refetch: refetchToday } =
    useFetch(getTodayAttendance);
  const [isClocking, setIsClocking] = useState(false);
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
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

  const handleClockIn = async () => {
    setIsClocking(true);
    try {
      await clockIn();
      showNotification("Clocked in successfully!", "success");
      setTimeout(() => {
        refetchToday();
      }, 500);
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || "Failed to clock in",
        "error"
      );
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setIsClocking(true);
    try {
      await clockOut();
      showNotification("Clocked out successfully!", "success");
      setTimeout(() => {
        refetchToday();
      }, 500);
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || "Failed to clock out",
        "error"
      );
    } finally {
      setIsClocking(false);
    }
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (value: any, row: any) => {
        const employee = row.employee || value;
        return employee?.user?.name || employee?.name || "Unknown";
      },
    },
    {
      key: "date",
      header: "Date",
      render: (value: string) => formatDate(value),
    },
    {
      key: "checkIn",
      header: "Clock In",
      render: (value: string) => (value ? formatTime(value) : "-"),
    },
    {
      key: "checkOut",
      header: "Clock Out",
      render: (value: string) => (value ? formatTime(value) : "-"),
    },
    {
      key: "totalHours",
      header: "Hours Worked",
      render: (value: number) => (value ? `${value.toFixed(1)}h` : "-"),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => {
        const status = value?.toUpperCase() || "";
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === "PRESENT"
                ? "bg-green-100 text-green-800"
                : status === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : status === "LATE"
                ? "bg-yellow-100 text-yellow-800"
                : status === "ABSENT"
                ? "bg-red-100 text-red-800"
                : status === "HALF_DAY"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status === "COMPLETED" ? "COMPLETED" : status || "Unknown"}
          </span>
        );
      },
    },
  ];

  // Filter attendance data based on user role
  const userEmployeeId =
    (user as any)?.employee?.id || (user as any)?.employeeId;
  const isAdmin = canAccessEmployees(user?.role || "EMPLOYEE");
  const filteredAttendance = isAdmin
    ? attendance?.attendance || []
    : attendance?.attendance?.filter((record: any) => {
        const recordEmployeeId = Number(record.employeeId);
        const userEmpId = Number(userEmployeeId);
        return recordEmployeeId === userEmpId;
      }) || [];

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
          <p className="text-red-800">Error loading attendance: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {isAdmin ? "Attendances List View" : "My Attendance"}
            </h1>
          </div>
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setViewType("list")}
                className={`px-4 py-2 rounded ${
                  viewType === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewType("calendar")}
                className={`px-4 py-2 rounded ${
                  viewType === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Calendar
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="Select specific date"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  Show All
                </button>
              )}
              <select className="px-3 py-2 border border-gray-300 rounded">
                <option>Day</option>
                <option>Week</option>
                <option>Month</option>
              </select>
            </div>
          </div>

          {/* Employee Actions - Only for employees */}
          {!isAdmin && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={handleClockIn}
                    disabled={
                      isClocking || todayAttendance?.attendance?.checkIn
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isClocking ? "Processing..." : "Clock In"}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={
                      isClocking ||
                      !todayAttendance?.attendance?.checkIn ||
                      todayAttendance?.attendance?.checkOut
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isClocking ? "Processing..." : "Clock Out"}
                  </button>
                </div>
                {todayAttendance?.attendance && (
                  <div className="text-sm text-gray-600">
                    {todayAttendance.attendance.checkIn && (
                      <span>
                        Clocked in:{" "}
                        {new Date(
                          todayAttendance.attendance.checkIn
                        ).toLocaleTimeString()}
                      </span>
                    )}
                    {todayAttendance.attendance.checkOut && (
                      <span className="ml-4">
                        Clocked out:{" "}
                        {new Date(
                          todayAttendance.attendance.checkOut
                        ).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <Table data={filteredAttendance || []} columns={columns} />
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
