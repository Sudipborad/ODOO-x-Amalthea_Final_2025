import React, { useState } from "react";
import { Table } from "../../components/ui/Table";
import { Calendar } from "../../components/ui/Calendar";
import { MonthlyAttendanceCalendar } from "../../components/ui/MonthlyAttendanceCalendar";
import { SingleEmployeeCalendar } from "../../components/ui/SingleEmployeeCalendar";
import { Notification } from "../../components/ui/Notification";
import { useFetch } from "../../hooks/useFetch";
import {
  getAttendance,
  clockIn,
  clockOut,
  getTodayAttendance,
  getAllEmployees,
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
  const [viewType, setViewType] = useState<"list" | "calendar" | "monthly">(
    "list"
  );
  const [isClocking, setIsClocking] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );

  const {
    data: attendance,
    loading,
    error,
    refetch,
  } = useFetch(() => {
    // If a specific date is selected, use that date range
    if (selectedDate) {
      return getAttendance({
        from: selectedDate,
        to: selectedDate,
        limit: 1000,
      });
    }

    // For monthly view, get current month's data; otherwise get last 30 days
    const today = new Date();
    let fromDate, toDate;

    if (viewType === "monthly") {
      // Get current month's data
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      fromDate = firstDayOfMonth.toISOString().split("T")[0];
      toDate = lastDayOfMonth.toISOString().split("T")[0];
    } else {
      // Get last 30 days
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      toDate = today.toISOString().split("T")[0];
    }

    const params: any = { from: fromDate, to: toDate, limit: 1000 };
    if (selectedEmployeeId) {
      params.employeeId = selectedEmployeeId;
    }

    return getAttendance(params);
  }, [selectedDate, viewType, selectedEmployeeId]);

  const { data: todayAttendance, refetch: refetchToday } =
    useFetch(getTodayAttendance);

  // Fetch employees for the dropdown filter
  const { data: employees } = useFetch(getAllEmployees);
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
      // Immediately refresh data
      refetchToday();
      refetch();
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
      // Immediately refresh data
      refetchToday();
      refetch();
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
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType("list")}
                className={`px-3 py-1 rounded text-sm ${
                  viewType === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewType("calendar")}
                className={`px-3 py-1 rounded text-sm ${
                  viewType === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewType("monthly")}
                className={`px-3 py-1 rounded text-sm ${
                  viewType === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Monthly
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
                  Show All Dates
                </button>
              )}

              {/* Employee Filter */}
              <select
                value={selectedEmployeeId || ""}
                onChange={(e) =>
                  setSelectedEmployeeId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">All Employees</option>
                {employees?.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user?.name ||
                      employee.name ||
                      `Employee ${employee.id}`}
                  </option>
                ))}
              </select>

              {selectedEmployeeId && (
                <button
                  onClick={() => setSelectedEmployeeId(null)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  Show All Employees
                </button>
              )}
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

          {/* Active Filters Display */}
          {(selectedDate || selectedEmployeeId) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-blue-800">
                  Active Filters:
                </span>
                {selectedDate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Date: {formatDate(selectedDate)}
                  </span>
                )}
                {selectedEmployeeId && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Employee:{" "}
                    {employees?.find(
                      (emp: any) => emp.id === selectedEmployeeId
                    )?.user?.name || "Unknown"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attendance View */}
          {viewType === "list" ? (
            <div className="overflow-x-auto">
              <Table data={filteredAttendance || []} columns={columns} />
            </div>
          ) : viewType === "calendar" ? (
            <Calendar
              events={(filteredAttendance || []).map((record: any) => ({
                id: record.id,
                date: record.date,
                title: record.employee?.user?.name || "Unknown",
                subtitle: record.checkIn
                  ? `${formatTime(record.checkIn)} - ${
                      record.checkOut ? formatTime(record.checkOut) : "Working"
                    }`
                  : "No clock in",
                status: record.status,
              }))}
              onDateClick={(date) => setSelectedDate(date)}
              selectedDate={selectedDate}
            />
          ) : selectedEmployeeId && viewType === "monthly" ? (
            <SingleEmployeeCalendar
              attendanceData={(filteredAttendance || []).map((record: any) => ({
                id: record.id,
                employeeId: record.employeeId,
                employeeName: record.employee?.user?.name || "Unknown",
                department: record.employee?.department || "General",
                date: record.date,
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
                totalHours: record.totalHours,
              }))}
              employeeName={
                employees?.find((emp: any) => emp.id === selectedEmployeeId)
                  ?.user?.name ||
                employees?.find((emp: any) => emp.id === selectedEmployeeId)
                  ?.name ||
                "Unknown Employee"
              }
              employeeDepartment={
                employees?.find((emp: any) => emp.id === selectedEmployeeId)
                  ?.department || "General"
              }
              onDateClick={(date) => setSelectedDate(date)}
            />
          ) : (
            <MonthlyAttendanceCalendar
              attendanceData={(filteredAttendance || []).map((record: any) => ({
                id: record.id,
                employeeId: record.employeeId,
                employeeName: record.employee?.user?.name || "Unknown",
                department: record.employee?.department || "General",
                empStatus: "Active",
                date: record.date,
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
              }))}
              onDateClick={(date, employeeId) => {
                setSelectedDate(date);
                if (!selectedEmployeeId) {
                  setSelectedEmployeeId(employeeId);
                }
              }}
            />
          )}
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
