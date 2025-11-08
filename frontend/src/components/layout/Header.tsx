import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { config } from "../../config/config";
import { UserRole } from "../../utils/roleUtils";
import { clockIn, clockOut, getTodayAttendance } from "../../api/apiAdapter";
import { Notification } from "../ui/Notification";
import { useFetch } from "../../hooks/useFetch";

export const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClocking, setIsClocking] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });

  // Fetch today's attendance status for employees
  const {
    data: todayAttendance,
    refetch: refetchAttendance,
    loading: attendanceLoading,
  } = useFetch(getTodayAttendance, [user?.role]);

  // Determine if user is checked in (only for employees)
  const isCheckedIn =
    user?.role === "EMPLOYEE" &&
    todayAttendance?.attendance?.checkIn &&
    !todayAttendance?.attendance?.checkOut;

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type, isVisible: true });
  };

  const handleClockIn = async () => {
    if (!todayAttendance?.canClockIn || isClocking) return;

    setIsClocking(true);
    try {
      await clockIn();
      showNotification("Clocked in successfully!", "success");
      // Wait a bit before refetching to ensure backend has processed
      setTimeout(() => {
        refetchAttendance();
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to clock in";
      showNotification(errorMessage, "error");
      console.error("Clock in error:", error);
    } finally {
      setIsClocking(false);
      setShowDropdown(false);
    }
  };

  const handleClockOut = async () => {
    if (!todayAttendance?.canClockOut || isClocking) return;

    setIsClocking(true);
    try {
      await clockOut();
      showNotification("Clocked out successfully!", "success");
      // Wait a bit before refetching to ensure backend has processed
      setTimeout(() => {
        refetchAttendance();
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to clock out";
      showNotification(errorMessage, "error");
      console.error("Clock out error:", error);
    } finally {
      setIsClocking(false);
      setShowDropdown(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WorkZen HRMS</h1>
            <p className="text-sm text-gray-600">
              Human Resources Management System
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mock Role Switcher - Only visible in mock mode */}
            {config.IS_MOCK_MODE && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Demo Role:</label>
                <select
                  value={user?.role || ""}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="HR">HR</option>
                  <option value="PAYROLL">Payroll</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                  {/* Check-in status indicator - only for employees */}
                  {user?.role === "EMPLOYEE" && (
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        isCheckedIn ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      title={isCheckedIn ? "Checked In" : "Not Checked In"}
                    />
                  )}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>

                    {user?.role === "EMPLOYEE" && (
                      <>
                        <hr className="my-1" />
                        <button
                          onClick={handleClockIn}
                          disabled={
                            isClocking ||
                            attendanceLoading ||
                            !todayAttendance?.canClockIn
                          }
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            !todayAttendance?.canClockIn
                              ? "Already checked in today"
                              : ""
                          }
                        >
                          {isClocking
                            ? "Processing..."
                            : attendanceLoading
                            ? "Loading..."
                            : "Check In"}
                        </button>
                        <button
                          onClick={handleClockOut}
                          disabled={
                            isClocking ||
                            attendanceLoading ||
                            !todayAttendance?.canClockOut
                          }
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            !todayAttendance?.canClockOut
                              ? "Not checked in yet"
                              : ""
                          }
                        >
                          {isClocking
                            ? "Processing..."
                            : attendanceLoading
                            ? "Loading..."
                            : "Check Out"}
                        </button>
                      </>
                    )}

                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
      />
    </>
  );
};
