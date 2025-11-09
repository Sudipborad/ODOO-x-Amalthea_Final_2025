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
import { EnhancedEmployeeProfile } from "../../components/ui/EnhancedEmployeeProfile";
import { CompleteProfileForm } from "../../components/ui/CompleteProfileForm";
import { CompleteProfileFormTabbed } from "../../components/ui/CompleteProfileFormTabbed";
import { TabbedEmployeeProfile } from "../../components/ui/TabbedEmployeeProfile";
import { updateEmployeeProfile } from "../../api/apiAdapter";
import axiosClient from "../../api/axiosClient";

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
    personalEmail?: string;
    panNumber?: string;
    uanNumber?: string;
    empCode?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
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

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [showCompleteForm, setShowCompleteForm] = React.useState(false);
  const {
    data: profile,
    loading,
    refetch,
  } = useFetch<UserProfile>(() =>
    axiosClient.get(`/profile`).then((res) => res.data)
  );

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      console.log("=== PROFILE PAGE UPDATE DEBUG ===");
      console.log("Employee ID:", profile?.employee?.id);
      console.log("Update data received:", updatedData);
      
      if (!profile?.employee?.id) {
        throw new Error("Employee ID not found");
      }

      const result = await updateEmployeeProfile(profile.employee.id, updatedData);
      console.log("Update result:", result);
      refetch();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const handleCompleteProfile = async (profileData: any) => {
    try {
      await axiosClient.post("/employees", {
        userId: profile?.id,
        ...profileData,
      });

      setShowCompleteForm(false);
      refetch();
    } catch (error) {
      console.error("Error completing profile:", error);
      alert("Failed to complete profile. Please try again.");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile?.employee) {
    if (showCompleteForm && (user?.role === "ADMIN" || user?.role === "HR")) {
      return (
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={() => setShowCompleteForm(false)}
              className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
            >
              ← Back to Profile
            </button>
          </div>

          <CompleteProfileFormTabbed
            user={{
              id: profile?.id || 0,
              name: profile?.name || "",
              email: profile?.email || "",
              role: profile?.role || "",
            }}
            onComplete={handleCompleteProfile}
            onCancel={() => setShowCompleteForm(false)}
          />
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Your employee profile needs to be set up.{" "}
              {user?.role === "ADMIN" || user?.role === "HR"
                ? "As an administrator, you can set up your own profile."
                : "Please contact HR or your manager to complete your profile setup."}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Current Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Name:
                  </label>
                  <p className="text-blue-900">{profile?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Email:
                  </label>
                  <p className="text-blue-900">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Role:
                  </label>
                  <p className="text-blue-900">{profile?.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    User ID:
                  </label>
                  <p className="text-blue-900">{profile?.id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user?.role === "ADMIN" || user?.role === "HR" ? (
                <button
                  onClick={() => setShowCompleteForm(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Set Up My Profile
                </button>
              ) : (
                <button
                  onClick={() =>
                    alert(
                      "Please contact HR or your administrator to set up your employee profile."
                    )
                  }
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Contact HR
                </button>
              )}
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform the profile data to match the TabbedEmployeeProfile interface
  const employeeData = {
    id: profile.employee.id,
    user: {
      name: profile.name,
      email: profile.email,
      role: profile.role,
    },
    department: profile.employee.department,
    designation: profile.employee.designation,
    joinDate: profile.employee.joinDate,
    baseSalary: profile.employee.baseSalary,
    dateOfBirth: profile.employee.dateOfBirth,
    gender: profile.employee.gender,
    nationality: profile.employee.nationality,
    maritalStatus: profile.employee.maritalStatus,
    residingAddress: profile.employee.address,
    // Get additional fields from profile
    personalEmail: profile.employee.personalEmail || "",
    panNumber: profile.employee.panNumber || "",
    uanNumber: profile.employee.uanNumber || "",
    empCode: profile.employee.empCode || "",
    bankName: profile.employee.bankName || "",
    accountNumber: profile.employee.accountNumber || "",
    ifscCode: profile.employee.ifscCode || "",
  };

  return (
    <div className="p-6">
      <TabbedEmployeeProfile
        employee={employeeData}
        canEdit={true}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};
