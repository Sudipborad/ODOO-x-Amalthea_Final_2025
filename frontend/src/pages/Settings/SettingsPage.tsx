import React, { useState } from "react";
import { Building, Users, Shield, Database, Plus, Trash2 } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";

interface CompanySettings {
  company: {
    id: number;
    name: string;
    email: string;
    phone: string;
    code: string;
  };
  departments: Array<{
    id: number;
    name: string;
  }>;
  roleStats: Array<{
    role: string;
    count: number;
  }>;
}

interface SystemSettings {
  auditLogs: Array<{
    id: number;
    action: string;
    details: string;
    timestamp: string;
    role: string;
  }>;
  stats: {
    totalUsers: number;
    totalEmployees: number;
    totalAttendanceRecords: number;
    totalPayruns: number;
  };
}

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const CompanyTab: React.FC<{ settings: CompanySettings }> = ({ settings }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: settings.company.name,
    email: settings.company.email,
    phone: settings.company.phone || "",
  });
  const [newDepartment, setNewDepartment] = useState("");

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/settings/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        window.location.reload();
      }
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) return;

    try {
      const response = await fetch("/api/settings/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newDepartment }),
      });

      if (response.ok) {
        setNewDepartment("");
        window.location.reload();
      }
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Building className="mr-2" size={20} />
            Company Information
          </h3>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Code
                </label>
                <input
                  type="text"
                  value={settings.company.code}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium">{settings.company.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{settings.company.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {settings.company.phone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company Code</p>
              <p className="font-medium">{settings.company.code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Departments */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Departments
        </h3>

        <form onSubmit={handleAddDepartment} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="Department name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {settings.departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <span>{dept.name}</span>
              <button className="text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Role Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="mr-2" size={20} />
          User Roles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {settings.roleStats.map((stat) => (
            <div
              key={stat.role}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
              <p className="text-sm text-gray-600">{stat.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SystemTab: React.FC<{ settings: SystemSettings }> = ({ settings }) => (
  <div className="space-y-6">
    {/* System Statistics */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Database className="mr-2" size={20} />
        System Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {settings.stats.totalUsers}
          </p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {settings.stats.totalEmployees}
          </p>
          <p className="text-sm text-gray-600">Employees</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">
            {settings.stats.totalAttendanceRecords}
          </p>
          <p className="text-sm text-gray-600">Attendance Records</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {settings.stats.totalPayruns}
          </p>
          <p className="text-sm text-gray-600">Payroll Runs</p>
        </div>
      </div>
    </div>

    {/* Audit Logs */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Activity Logs</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("company");
  const { data: companySettings, loading: companyLoading } =
    useFetch<CompanySettings>("/api/settings/company");
  const { data: systemSettings, loading: systemLoading } =
    useFetch<SystemSettings>("/api/settings/system");

  const tabs = [
    { id: "company", label: "Company", icon: <Building size={16} /> },
    { id: "system", label: "System", icon: <Database size={16} /> },
  ];

  if (companyLoading || systemLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return companySettings ? (
          <CompanyTab settings={companySettings} />
        ) : null;
      case "system":
        return systemSettings ? <SystemTab settings={systemSettings} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
};
