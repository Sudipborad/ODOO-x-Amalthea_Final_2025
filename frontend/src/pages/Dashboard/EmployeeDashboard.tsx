import React from 'react';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

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
              <p className="text-2xl font-bold">22 Days</p>
              <p className="text-xs text-green-600">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="text-yellow-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Leave Balance</p>
              <p className="text-2xl font-bold">8 Days</p>
              <p className="text-xs text-gray-600">Remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <DollarSign className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold">₹45,000</p>
              <p className="text-xs text-gray-600">Salary</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <User className="text-purple-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Profile</p>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-orange-600">Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium">Mark Attendance</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
            <span className="text-sm font-medium">Apply Leave</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
            <span className="text-sm font-medium">View Payslip</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <User className="mx-auto mb-2 text-purple-600" size={24} />
            <span className="text-sm font-medium">Update Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};