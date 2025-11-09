import React, { useState } from "react";

interface AttendanceRecord {
  id: string | number;
  employeeId: number;
  employeeName: string;
  department?: string;
  empStatus?: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
}

interface MonthlyAttendanceCalendarProps {
  attendanceData: AttendanceRecord[];
  onDateClick?: (date: string, employeeId: number) => void;
}

export const MonthlyAttendanceCalendar: React.FC<
  MonthlyAttendanceCalendarProps
> = ({ attendanceData, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const getAttendanceStatus = (employeeId: number, dateStr: string) => {
    const record = attendanceData.find(
      (att) =>
        att.employeeId === employeeId && att.date.split("T")[0] === dateStr
    );
    return record?.status || "NA";
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
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "LATE":
        return "bg-orange-100 text-orange-800";
      case "HALF_DAY":
        return "bg-blue-100 text-blue-800";
      case "LEAVE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Get unique employees from attendance data
  const employees = attendanceData.reduce((acc: any[], record) => {
    const existingEmployee = acc.find(
      (emp) => emp.employeeId === record.employeeId
    );
    if (!existingEmployee) {
      acc.push({
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department || "General",
        empStatus: record.empStatus || "Active",
      });
    }
    return acc;
  }, []);

  const daysInMonth = getDaysInMonth(currentDate);
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

  const dayNames = [
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-200 rounded"
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
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-200 rounded"
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

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                #
              </th>
              <th className="sticky left-12 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10 min-w-48">
                Employee
              </th>
              <th className="sticky left-60 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                Department
              </th>
              <th className="sticky left-80 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                Emp Status
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => (
                  <th
                    key={day}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-12"
                  >
                    <div>{day}</div>
                    <div className="text-xs text-gray-400">
                      {dayNames[day - 1] || "Day"}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee, index) => (
              <tr key={employee.employeeId} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-4 py-3 text-sm text-gray-900 border-r border-gray-200 z-10">
                  {index + 1}
                </td>
                <td className="sticky left-12 bg-white px-4 py-3 border-r border-gray-200 z-10">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {employee.employeeName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {employee.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="sticky left-60 bg-white px-4 py-3 text-sm text-gray-900 border-r border-gray-200 z-10">
                  {employee.department}
                </td>
                <td className="sticky left-80 bg-white px-4 py-3 border-r border-gray-200 z-10">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.empStatus === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {employee.empStatus}
                  </span>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = formatDateString(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    );
                    const status = getAttendanceStatus(
                      employee.employeeId,
                      dateStr
                    );
                    const displayStatus = getStatusDisplay(status);
                    const colorClass = getStatusColor(status);

                    return (
                      <td
                        key={day}
                        className="px-2 py-3 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          onDateClick &&
                          onDateClick(dateStr, employee.employeeId)
                        }
                      >
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded ${colorClass}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                    );
                  }
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-green-100 text-green-800">
              P
            </span>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-red-100 text-red-800">
              A
            </span>
            <span className="text-gray-600">Absent</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-orange-100 text-orange-800">
              L
            </span>
            <span className="text-gray-600">Late</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-blue-100 text-blue-800">
              H
            </span>
            <span className="text-gray-600">Half Day</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-purple-100 text-purple-800">
              WO
            </span>
            <span className="text-gray-600">Work Off</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-gray-100 text-gray-500">
              NA
            </span>
            <span className="text-gray-600">Not Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
