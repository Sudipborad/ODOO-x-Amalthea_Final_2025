import React from "react";import React from "react";import React from "react";import React from "react";

import { MyProfile } from "./MyProfile";

import { useAuth } from "../../context/AuthContext";

export const ProfilePage: React.FC = () => {

  return <MyProfile />;import { useFetch } from "../../hooks/useFetch";import { useAuth } from "../../context/AuthContext";import { useAuth } from "../../context/AuthContext";

};
import { EnhancedEmployeeProfile } from "../../components/ui/EnhancedEmployeeProfile";

import { updateEmployeeProfile } from "../../api/apiAdapter";import { useFetch } from "../../hooks/useFetch";import { useFetch } from "../../hooks/useFetch";



interface UserProfile {import { EnhancedEmployeeProfile } from "../../components/ui/EnhancedEmployeeProfile";import { EnhancedEmployeeProfile } from "../../components/ui/EnhancedEmployeeProfile";

  id: number;

  name: string;import { updateEmployeeProfile } from "../../api/apiAdapter";import { updateEmployeeProfile } from "../../api/apiAdapter";

  email: string;

  role: string;

  employee?: {

    id: number;interface UserProfile {interface UserProfile {

    department: string;

    designation: string;  id: number;  id: number;

    joinDate: string;

    baseSalary: number;  name: string;  name: string;

    dateOfBirth?: string;

    address?: string;  email: string;  email: string;

    gender?: string;

    nationality?: string;  role: string;  role: string;

    maritalStatus?: string;

    manager?: {  employee?: {  employee?: {

      user: { name: string };

    };    id: number;    id: number;

  };

}    department: string;    department: string;



export const ProfilePage: React.FC = () => {    designation: string;    designation: string;

  const { user } = useAuth();

  const {    joinDate: string;    joinDate: string;

    data: profile,

    loading,    baseSalary: number;    baseSalary: number;

    refetch,

  } = useFetch<UserProfile>(() =>     dateOfBirth?: string;    dateOfBirth?: string;

    fetch(`/api/profile/me`, {

      headers: {    address?: string;    address?: string;

        Authorization: `Bearer ${localStorage.getItem("token")}`,

      },    gender?: string;    gender?: string;

    }).then(res => res.json())

  );    nationality?: string;    nationality?: string;



  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {    maritalStatus?: string;    maritalStatus?: string;

    try {

      if (!profile?.employee?.id) {    manager?: {    manager?: {

        throw new Error('Employee ID not found');

      }      user: { name: string };      user: { name: string };

      

      await updateEmployeeProfile(profile.employee.id, updatedData);    };    };

      refetch();

    } catch (error) {  };  };

      console.error('Error updating profile:', error);

      throw error;}}

    }

  };



  if (loading) {export const ProfilePage: React.FC = () => {export const ProfilePage: React.FC = () => {

    return (

      <div className="p-6 flex items-center justify-center">  const { user } = useAuth();  const { user } = useAuth();

        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

      </div>  const {  const {

    );

  }    data: profile,    data: profile,



  if (!profile?.employee) {    loading,    loading,

    return (

      <div className="p-6 text-center text-gray-500">Employee profile not found</div>    refetch,    refetch,

    );

  }  } = useFetch<UserProfile>(() =>   } = useFetch<UserProfile>(() => 



  // Transform the profile data to match the EnhancedEmployeeProfile interface    fetch(`/api/profile/me`, {    fetch(`/api/profile/me`, {

  const employeeData = {

    id: profile.employee.id,      headers: {      headers: {

    user: {

      name: profile.name,        Authorization: `Bearer ${localStorage.getItem("token")}`,        Authorization: `Bearer ${localStorage.getItem("token")}`,

      email: profile.email,

      role: profile.role,      },      },

    },

    department: profile.employee.department,    }).then(res => res.json())    }).then(res => res.json())

    designation: profile.employee.designation,

    joinDate: profile.employee.joinDate,  );  );

    baseSalary: profile.employee.baseSalary,

    dateOfBirth: profile.employee.dateOfBirth,

    gender: profile.employee.gender,

    nationality: profile.employee.nationality,  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {

    maritalStatus: profile.employee.maritalStatus,

    address: profile.employee.address,    try {    try {

    manager: profile.employee.manager,

    // Add default values for new fields that might not exist yet      if (!profile?.employee?.id) {      if (!profile?.employee?.id) {

    phoneNumber: '',

    emergencyContactName: '',        throw new Error('Employee ID not found');        throw new Error('Employee ID not found');

    emergencyContactPhone: '',

    emergencyContactRelation: '',      }      }

    panNumber: '',

    aadharNumber: '',            

    esiNumber: '',

    pfNumber: '',      await updateEmployeeProfile(profile.employee.id, updatedData);      await updateEmployeeProfile(profile.employee.id, updatedData);

    uanNumber: '',

    bankName: '',      refetch();      refetch();

    accountNumber: '',

    ifscCode: '',    } catch (error) {    } catch (error) {

    branchName: '',

    workLocation: '',      console.error('Error updating profile:', error);      console.error('Error updating profile:', error);

    employmentType: '',

    workShift: '',      throw error;      throw error;

    probationPeriod: undefined,

    noticePeriod: undefined,    }    }

    skills: [],

    certifications: [],  };  };

    bloodGroup: '',

    medicalConditions: '',

    healthInsuranceNumber: '',

  };  if (loading) {    if (loading) {



  return (    return (    return (

    <div className="p-6">

      <div className="mb-6">      <div className="p-6 flex items-center justify-center">      <div className="p-6 flex items-center justify-center">

        <button

          onClick={() => (window.location.href = "/dashboard")}        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"

        >      </div>      </div>

          ← Back to Dashboard

        </button>    );    );

      </div>

  }  }

      <EnhancedEmployeeProfile

        employee={employeeData}

        canEdit={true}

        onUpdate={handleUpdateProfile}  if (!profile?.employee) {  if (!profile?.employee) {

      />

    </div>    return (    return (

  );

};      <div className="p-6 text-center text-gray-500">Employee profile not found</div>      <div className="p-6 text-center text-gray-500">Employee profile not found</div>

    );    );

  }  }



  // Transform the profile data to match the EnhancedEmployeeProfile interface  // Transform the profile data to match the EnhancedEmployeeProfile interface

  const employeeData = {  const employeeData = {

    id: profile.employee.id,    id: profile.employee.id,

    user: {    user: {

      name: profile.name,      name: profile.name,

      email: profile.email,      email: profile.email,

      role: profile.role,      role: profile.role,

    },    },

    department: profile.employee.department,    department: profile.employee.department,

    designation: profile.employee.designation,    designation: profile.employee.designation,

    joinDate: profile.employee.joinDate,    joinDate: profile.employee.joinDate,

    baseSalary: profile.employee.baseSalary,    baseSalary: profile.employee.baseSalary,

    dateOfBirth: profile.employee.dateOfBirth,    dateOfBirth: profile.employee.dateOfBirth,

    gender: profile.employee.gender,    gender: profile.employee.gender,

    nationality: profile.employee.nationality,    nationality: profile.employee.nationality,

    maritalStatus: profile.employee.maritalStatus,    maritalStatus: profile.employee.maritalStatus,

    address: profile.employee.address,    address: profile.employee.address,

    manager: profile.employee.manager,    manager: profile.employee.manager,

    // Add default values for new fields that might not exist yet    // Add default values for new fields that might not exist yet

    phoneNumber: '',    phoneNumber: '',

    emergencyContactName: '',    emergencyContactName: '',

    emergencyContactPhone: '',    emergencyContactPhone: '',

    emergencyContactRelation: '',    emergencyContactRelation: '',

    panNumber: '',    panNumber: '',

    aadharNumber: '',    aadharNumber: '',

    esiNumber: '',    esiNumber: '',

    pfNumber: '',    pfNumber: '',

    uanNumber: '',    uanNumber: '',

    bankName: '',    bankName: '',

    accountNumber: '',    accountNumber: '',

    ifscCode: '',    ifscCode: '',

    branchName: '',    branchName: '',

    workLocation: '',    workLocation: '',

    employmentType: '',    employmentType: '',

    workShift: '',    workShift: '',

    probationPeriod: undefined,    probationPeriod: undefined,

    noticePeriod: undefined,    noticePeriod: undefined,

    skills: [],    skills: [],

    certifications: [],    certifications: [],

    bloodGroup: '',    bloodGroup: '',

    medicalConditions: '',    medicalConditions: '',

    healthInsuranceNumber: '',    healthInsuranceNumber: '',

  };  };



  return (  return (

    <div className="p-6">    <div className="p-6">

      <div className="mb-6">      <div className="mb-6">

        <button        <button

          onClick={() => (window.location.href = "/dashboard")}          onClick={() => (window.location.href = "/dashboard")}

          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"

        >        >

          ← Back to Dashboard          ← Back to Dashboard

        </button>        </button>

      </div>      </div>



      <EnhancedEmployeeProfile      <EnhancedEmployeeProfile

        employee={employeeData}        employee={employeeData}

        canEdit={true}        canEdit={true}

        onUpdate={handleUpdateProfile}        onUpdate={handleUpdateProfile}

      />      />

    </div>    </div>

  );  );

};};

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Employee ID:
                </label>
                <p className="text-gray-900">
                  {profile?.userId || "Not assigned"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email:
                </label>
                <p className="text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Role:
                </label>
                <p className="text-gray-900">{profile?.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status:
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    profile?.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile?.isVerified ? "Active" : "Pending Verification"}
                </span>
              </div>
            </div>

            {/* Personal Details Form */}
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Details
              </h3>

              <div className="space-y-4">
                <FormField
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, name: value }))
                  }
                  required
                />

                {profile?.employee && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Department"
                        value={formData.department}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            department: value,
                          }))
                        }
                      />

                      <FormField
                        label="Designation"
                        value={formData.designation}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            designation: value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Employee Details Sidebar */}
          <div className="space-y-6">
            {profile?.employee && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Employment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Join Date
                    </label>
                    <p className="text-gray-900">
                      {profile.employee.joinDate
                        ? new Date(
                            profile.employee.joinDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Base Salary
                    </label>
                    <p className="text-gray-900">
                      {profile.employee.baseSalary
                        ? `₹${profile.employee.baseSalary.toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Allowances
                    </label>
                    <p className="text-gray-900">
                      {profile.employee.allowances
                        ? `₹${profile.employee.allowances.toLocaleString()}`
                        : "₹0"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!profile?.isVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Pending Verification
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Your profile is under review by the admin. You'll be
                      notified once it's approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
      />
    </div>
  );
};
