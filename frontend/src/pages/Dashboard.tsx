import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  User,
} from "lucide-react";
import { Calendar as CalendarComponent } from "../components/ui/Calendar";
import { useFetch } from "../hooks/useFetch";
import {
  getDashboardSummary,
  getDashboardAlerts,
  getEmployeeDashboard,
  getDashboardActivities,
} from "../api/apiAdapter";

interface DashboardSummary {
  totalEmployees: number;
  attendancePercentage: number;
  activeLeaves: number;
  payrollSummary: {
    totalGross: number;
    totalNet: number;
    employeeCount: number;
  };
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
  monthlySalaryExpense: Array<{
    _sum: { net: number };
  }>;
}

interface DashboardAlerts {
  pendingLeaves: number;
  incompleteProfiles: number;
  notifications: Array<{
    id: number;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("text-", "bg-")
          .replace("-600", "-100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<"overview" | "calendar">("overview");
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } =
    useFetch<DashboardSummary>(getDashboardSummary);
  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } =
    useFetch<DashboardAlerts>(getDashboardAlerts);
  
  // Debug logging
  console.log('Dashboard Summary Data:', summary);
  console.log('Dashboard Alerts Data:', alerts);
  const { data: employeeData, loading: employeeLoading, error: employeeError, refetch: refetchEmployeeData } = useFetch(getEmployeeDashboard);
  const { data: recentActivities, refetch: refetchActivities } = useFetch(getDashboardActivities);

  // Show employee dashboard for non-admin users
  if (user?.role === "EMPLOYEE") {
    if (employeeLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your personal dashboard</p>
          {employeeError && (
            <p className="text-red-600 text-sm mt-2">Error loading dashboard data: {employeeError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  {employeeData?.attendanceCount || 0} Days
                </p>
                <p className="text-xs text-green-600">Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="text-yellow-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Leave Balance</p>
                <p className="text-2xl font-bold">
                  {employeeData?.leaveBalance || 0} Days
                </p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <DollarSign className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  ${employeeData?.currentSalary?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-600">Salary</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <User className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Profile</p>
                <p className="text-2xl font-bold">
                  {employeeData?.profileCompletion || 0}%
                </p>
                <p className="text-xs text-orange-600">Complete</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/attendance"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
              <span className="text-sm font-medium">Mark Attendance</span>
            </Link>
            <Link
              to="/timeoff"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
              <span className="text-sm font-medium">Apply Leave</span>
            </Link>
            <Link
              to="/payslips"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
              <span className="text-sm font-medium">View Payslip</span>
            </Link>
            <Link
              to="/profile"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <User className="mx-auto mb-2 text-purple-600" size={24} />
              <span className="text-sm font-medium">Update Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (summaryLoading || alertsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    { title: "Add Employee", link: "/employees" },
    { title: "Process Payroll", link: "/payroll" },
    { title: "Review Requests", link: "/timeoff" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType("overview")}
            className={`px-3 py-1 rounded text-sm ${
              viewType === "overview" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType("calendar")}
            className={`px-3 py-1 rounded text-sm ${
              viewType === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {viewType === "overview" ? (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Employees"
              value={summary?.totalEmployees || 0}
              icon={<Users size={24} />}
              color="text-blue-600"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${summary?.attendancePercentage || 0}%`}
              icon={<Calendar size={24} />}
              color="text-green-600"
              subtitle="This month"
            />
            <DashboardCard
              title="Active Leaves"
              value={summary?.activeLeaves || 0}
              icon={<Clock size={24} />}
              color="text-yellow-600"
            />
            <DashboardCard
              title="Monthly Payroll"
              value={`$${(
                summary?.payrollSummary?.totalNet || 0
              ).toLocaleString()}`}
              icon={<DollarSign size={24} />}
              color="text-purple-600"
              subtitle={`${
                summary?.payrollSummary?.employeeCount || 0
              } employees`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <Link
                  to="/reports"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities?.length ? (
                  recentActivities.map((activity: any, index: number) => {
                    const actionText =
                      activity.action || activity.details || "Activity";
                    const timestamp = activity.timestamp || activity.createdAt;
                    const role = activity.role || "USER";

                    return (
                      <div
                        key={activity.id || index}
                        className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {role.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {actionText}
                          </p>
                          <p className="text-xs text-gray-500">
                            {timestamp
                              ? new Date(timestamp).toLocaleString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Department Distribution
              </h2>
              <div className="space-y-3">
                {summary?.departmentStats?.length ? (
                  summary.departmentStats.map((dept, index) => {
                    const percentage =
                      summary.totalEmployees > 0
                        ? Math.round(
                            (dept.count / summary.totalEmployees) * 100
                          )
                        : 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium">{dept.department}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {dept.count} employees
                          </span>
                          <span className="text-sm font-medium">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No department data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Alerts & Notifications
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm font-medium">Total Leaves</span>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    {alerts?.pendingLeaves || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium">
                    Incomplete Profiles
                  </span>
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {alerts?.incompleteProfiles || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <CalendarComponent
          events={[
            ...(recentActivities?.activities || []).map((activity: any) => ({
              id: activity.id,
              date: activity.createdAt,
              title: activity.type || "Activity",
              subtitle: activity.description || "",
              status: "INFO",
            })),
            ...(alerts?.notifications || []).map((notification: any) => ({
              id: `notif-${notification.id}`,
              date: notification.createdAt,
              title: "Notification",
              subtitle: notification.message,
              status: notification.type?.toUpperCase() || "INFO",
            })),
          ]}
        />
      )}
    </div>
  );
};
