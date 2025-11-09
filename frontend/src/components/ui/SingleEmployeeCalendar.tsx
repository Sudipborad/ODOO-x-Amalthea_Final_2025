import React, { useState } from "react";
import { formatTime } from "../../utils/format";

interface AttendanceRecord {
  id: string | number;
  employeeId: number;
  employeeName: string;
  department?: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
}

interface SingleEmployeeCalendarProps {
  attendanceData: AttendanceRecord[];
  employeeName: string;
  employeeDepartment?: string;
  onDateClick?: (date: string) => void;
}

export const SingleEmployeeCalendar: React.FC<SingleEmployeeCalendarProps> = ({
  attendanceData,
  employeeName,
  employeeDepartment,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getAttendanceForDate = (dateStr: string) => {
    return attendanceData.find(
      (record) => record.date.split("T")[0] === dateStr
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
      case "COMPLETED":
        return "P";
      case "ABSENT":
        return "A";
      case "LATE":
        return "L";
      case "HALF_DAY":
        return "H";
      case "LEAVE":
        return "WO";
      default:
        return "NA";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-300";
      case "LATE":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "HALF_DAY":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "LEAVE":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-500 border-gray-300";
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 border border-gray-200 bg-gray-50"
        ></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateStr = formatDateString(date);
      const attendance = getAttendanceForDate(dateStr);
      const isToday = dateStr === formatDateString(new Date());

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? "bg-yellow-50 border-yellow-300" : ""
          }`}
          onClick={() => onDateClick && onDateClick(dateStr)}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              isToday ? "text-blue-600" : "text-gray-900"
            }`}
          >
            {day}
          </div>

          {attendance ? (
            <div className="space-y-1">
              <div
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                  attendance.status
                )}`}
              >
                {getStatusDisplay(attendance.status)} - {attendance.status}
              </div>

              {attendance.checkIn && (
                <div className="text-xs text-gray-600">
                  In: {formatTime(attendance.checkIn)}
                </div>
              )}

              {attendance.checkOut && (
                <div className="text-xs text-gray-600">
                  Out: {formatTime(attendance.checkOut)}
                </div>
              )}

              {attendance.totalHours && (
                <div className="text-xs text-gray-600 font-medium">
                  {attendance.totalHours.toFixed(1)}h
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No data</div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate monthly stats
  const monthlyAttendance = attendanceData.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getFullYear() === currentDate.getFullYear() &&
      recordDate.getMonth() === currentDate.getMonth()
    );
  });

  const presentDays = monthlyAttendance.filter((record) =>
    ["PRESENT", "COMPLETED", "LATE"].includes(record.status.toUpperCase())
  ).length;

  const totalWorkingDays = getDaysInMonth(currentDate);
  const attendancePercentage =
    totalWorkingDays > 0
      ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Employee Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {employeeName}
            </h3>
            {employeeDepartment && (
              <p className="text-sm text-gray-600">{employeeDepartment}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {attendancePercentage}%
            </div>
            <div className="text-xs text-gray-600">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Monthly Stats */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {presentDays}
            </div>
            <div className="text-xs text-gray-600">Present Days</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {
                monthlyAttendance.filter(
                  (r) => r.status.toUpperCase() === "ABSENT"
                ).length
              }
            </div>
            <div className="text-xs text-gray-600">Absent Days</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {
                monthlyAttendance.filter(
                  (r) => r.status.toUpperCase() === "LATE"
                ).length
              }
            </div>
            <div className="text-xs text-gray-600">Late Days</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {monthlyAttendance
                .reduce((sum, record) => sum + (record.totalHours || 0), 0)
                .toFixed(1)}
              h
            </div>
            <div className="text-xs text-gray-600">Total Hours</div>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-sm font-medium text-gray-700 text-center bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">{renderCalendarDays()}</div>
    </div>
  );
};
