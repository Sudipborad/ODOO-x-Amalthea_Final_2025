import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, DollarSign, TrendingUp, AlertCircle, User } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { 
  getDashboardSummary, 
  getDashboardAlerts, 
  getEmployeeDashboard,
  getDashboardActivities 
} from '../api/apiAdapter';

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
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: summary, loading: summaryLoading } = useFetch<DashboardSummary>(getDashboardSummary);
  const { data: alerts, loading: alertsLoading } = useFetch<DashboardAlerts>(getDashboardAlerts);
  const { data: employeeData } = useFetch(getEmployeeDashboard);
  const { data: recentActivities } = useFetch(getDashboardActivities);

  // Show employee dashboard for non-admin users
  if (user?.role === 'EMPLOYEE') {
    
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your personal dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">{employeeData?.attendanceCount || 0} Days</p>
                <p className="text-xs text-green-600">Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="text-yellow-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Leave Balance</p>
                <p className="text-2xl font-bold">{employeeData?.leaveBalance || 0} Days</p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <DollarSign className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">₹{employeeData?.currentSalary?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-600">Salary</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <User className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Profile</p>
                <p className="text-2xl font-bold">{employeeData?.profileCompletion || 0}%</p>
                <p className="text-xs text-orange-600">Complete</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/attendance" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
              <span className="text-sm font-medium">Mark Attendance</span>
            </Link>
            <Link to="/timeoff" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
              <span className="text-sm font-medium">Apply Leave</span>
            </Link>
            <Link to="/payslips" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
              <span className="text-sm font-medium">View Payslip</span>
            </Link>
            <Link to="/profile" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
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
    { title: 'Add Employee', link: '/employees' },
    { title: 'Generate Report', link: '/reports' },
    { title: 'Process Payroll', link: '/payroll' },
    { title: 'Review Requests', link: '/timeoff' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's what's happening today.</p>
      </div>

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
          value={`₹${(summary?.payrollSummary?.totalNet || 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="text-purple-600"
          subtitle={`${summary?.payrollSummary?.employeeCount || 0} employees`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities?.length ? recentActivities.map((activity: any, index: number) => {
              const actionText = activity.action || activity.details || 'Activity';
              const timestamp = activity.timestamp || activity.createdAt;
              const role = activity.role || 'USER';
              
              return (
                <div key={activity.id || index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{role.charAt(0) || 'U'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {actionText}
                    </p>
                    <p className="text-xs text-gray-500">
                      {timestamp ? new Date(timestamp).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="space-y-3">
            {summary?.departmentStats?.length ? summary.departmentStats.map((dept, index) => {
              const percentage = summary.totalEmployees > 0 
                ? Math.round((dept.count / summary.totalEmployees) * 100) 
                : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{dept.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{dept.count} employees</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No department data available</p>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="text-sm font-medium">Pending Leaves</span>
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {alerts?.pendingLeaves || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium">Incomplete Profiles</span>
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                {alerts?.incompleteProfiles || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};