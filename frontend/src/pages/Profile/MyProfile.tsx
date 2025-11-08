import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  employee?: {
    id: number;
    department: string;
    designation: string;
    joinDate: string;
    baseSalary: number;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    nationality?: string;
    maritalStatus?: string;
    manager?: {
      user: { name: string };
    };
  };
}

const ProfileCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    {children}
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-center space-x-3 py-2">
    {icon && <div className="text-gray-400">{icon}</div>}
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "Not provided"}</p>
    </div>
  </div>
);

export const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const {
    data: profile,
    loading,
    refetch,
  } = useFetch<UserProfile>(`/api/profile/me`);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        dateOfBirth: profile.employee?.dateOfBirth || "",
        address: profile.employee?.address || "",
        gender: profile.employee?.gender || "",
        nationality: profile.employee?.nationality || "",
        maritalStatus: profile.employee?.maritalStatus || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        refetch();
      }
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-500">Profile not found</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and settings
          </p>
        </div>
        <div className="flex space-x-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Save size={16} className="mr-1" />
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <X size={16} className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600">
              {profile.employee?.designation || "Employee"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {profile.employee?.department || "No Department"}
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Building size={16} />
                <span>{profile.role}</span>
              </div>
              {profile.employee?.joinDate && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>
                    Joined{" "}
                    {new Date(profile.employee.joinDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <ProfileCard title="Basic Information" icon={<User size={20} />}>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maritalStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <InfoRow
                  label="Full Name"
                  value={profile.name}
                  icon={<User size={16} />}
                />
                <InfoRow
                  label="Date of Birth"
                  value={
                    profile.employee?.dateOfBirth
                      ? new Date(
                          profile.employee.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"
                  }
                  icon={<Calendar size={16} />}
                />
                <InfoRow
                  label="Gender"
                  value={profile.employee?.gender || "Not provided"}
                />
                <InfoRow
                  label="Nationality"
                  value={profile.employee?.nationality || "Not provided"}
                />
                <InfoRow
                  label="Marital Status"
                  value={profile.employee?.maritalStatus || "Not provided"}
                />
                <InfoRow
                  label="Address"
                  value={profile.employee?.address || "Not provided"}
                  icon={<MapPin size={16} />}
                />
              </div>
            )}
          </ProfileCard>

          {/* Work Information */}
          {profile.employee && (
            <ProfileCard title="Work Information" icon={<Building size={20} />}>
              <div className="space-y-2">
                <InfoRow
                  label="Department"
                  value={profile.employee.department}
                />
                <InfoRow
                  label="Designation"
                  value={profile.employee.designation}
                />
                <InfoRow
                  label="Join Date"
                  value={new Date(
                    profile.employee.joinDate
                  ).toLocaleDateString()}
                  icon={<Calendar size={16} />}
                />
                <InfoRow
                  label="Manager"
                  value={profile.employee.manager?.user.name || "Not assigned"}
                  icon={<User size={16} />}
                />
                <InfoRow
                  label="Base Salary"
                  value={`₹${profile.employee.baseSalary.toLocaleString()}`}
                />
              </div>
            </ProfileCard>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {profile.employee?.attendanceRate || 0}%
              </p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {profile.employee?.leaveDaysUsed || 0}
              </p>
              <p className="text-sm text-gray-600">Leave Days Used</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {profile.employee?.yearsOfService || 0}
              </p>
              <p className="text-sm text-gray-600">Years of Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
