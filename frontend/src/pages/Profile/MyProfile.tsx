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
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    panNumber?: string;
    uanNumber?: string;
    employeeCode?: string;
    aadharNumber?: string;
    esiNumber?: string;
    pfNumber?: string;
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
  } = useFetch<UserProfile>(() =>
    axiosClient.get("/profile").then((res) => res.data)
  );

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      if (!profile?.employee?.id) {
        throw new Error("Employee ID not found");
      }

      await updateEmployeeProfile(profile.employee.id, updatedData);
      refetch();
    } catch (error) {
      console.error("Error updating profile:", error);
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
    return (
      <div className="p-6 text-center text-gray-500">
        Employee profile not found
      </div>
    );
  }

  // Transform the profile data to match the EnhancedEmployeeProfile interface
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
    address: profile.employee.address,
    manager: profile.employee.manager,
    // Add default values for new fields that might not exist yet
    phoneNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    panNumber: profile.employee.panNumber || "",
    aadharNumber: profile.employee.aadharNumber || "",
    esiNumber: profile.employee.esiNumber || "",
    pfNumber: profile.employee.pfNumber || "",
    uanNumber: profile.employee.uanNumber || "",
    bankName: profile.employee.bankName || "",
    accountNumber: profile.employee.bankAccountNumber || "",
    ifscCode: profile.employee.ifscCode || "",
    branchName: "",
    workLocation: "",
    employmentType: "",
    workShift: "",
    probationPeriod: undefined,
    noticePeriod: undefined,
    skills: [],
    certifications: [],
    bloodGroup: "",
    medicalConditions: "",
    healthInsuranceNumber: "",
  };

  return (
    <div className="p-6">
      <EnhancedEmployeeProfile
        employee={employeeData}
        canEdit={true}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};
