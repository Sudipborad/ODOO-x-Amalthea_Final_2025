import React, { useState } from "react";
import {
  User,
  Building,
  Calendar,
  MapPin,
  Phone,
  Save,
  X,
  FileText,
  DollarSign,
  Shield,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

interface CompleteProfileFormProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onComplete: (profileData: any) => Promise<void>;
  onCancel: () => void;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      hidden={value !== index}
      className={value === index ? "block" : "hidden"}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  sensitive?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  sensitive = false,
  options,
  placeholder,
}) => {
  const [showSensitive, setShowSensitive] = useState(false);

  if (type === "select" && options) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {sensitive && (
            <Lock size={12} className="inline ml-1 text-yellow-500" />
          )}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {sensitive && (
          <Lock size={12} className="inline ml-1 text-yellow-500" />
        )}
      </label>
      <div className="relative">
        <input
          type={sensitive && !showSensitive ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
        {sensitive && (
          <button
            type="button"
            onClick={() => setShowSensitive(!showSensitive)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showSensitive ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const CompleteProfileFormTabbed: React.FC<CompleteProfileFormProps> = ({
  user,
  onComplete,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Resume Tab
    department: "",
    designation: "",
    baseSalary: "",
    allowances: "0",
    joinDate: new Date().toISOString().split("T")[0],

    // Private Info Tab
    dateOfBirth: "",
    residingAddress: "",
    nationality: "Indian",
    personalEmail: "",
    gender: "",
    maritalStatus: "",

    // Salary Info Tab - Bank Details
    bankName: "",
    accountNumber: "",
    ifscCode: "",

    // Security Tab
    panNumber: "",
    uanNumber: "",
    empCode: "",
  });

  const tabs = [
    { id: 0, label: "Resume", icon: <FileText size={16} /> },
    { id: 1, label: "Private Info", icon: <User size={16} /> },
    { id: 2, label: "Salary Info", icon: <DollarSign size={16} /> },
    { id: 3, label: "Security", icon: <Shield size={16} /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        joinDate: new Date(formData.joinDate),
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth)
          : undefined,
      };

      await onComplete(profileData);
    } catch (error) {
      console.error("Error completing profile:", error);
      alert("Failed to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  const isTabValid = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: // Resume
        return (
          formData.department &&
          formData.designation &&
          formData.baseSalary &&
          formData.joinDate
        );
      case 1: // Private Info
        return (
          formData.dateOfBirth &&
          formData.residingAddress &&
          formData.nationality &&
          formData.gender
        );
      case 2: // Salary Info
        return true; // Optional fields
      case 3: // Security
        return true; // Optional fields
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    return isTabValid(activeTab);
  };

  const handleNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Fill in your employee information across all sections
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50"
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* User Info Banner */}
      <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{user.name}</h3>
              <p className="text-sm text-blue-700">
                {user.email} • {user.role}
              </p>
            </div>
          </div>
          <div className="text-sm text-blue-700">User ID: {user.id}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 relative ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {/* Validation indicator */}
                {isTabValid(tab.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Resume Tab */}
          <TabPanel value={activeTab} index={0}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Department"
                value={formData.department}
                onChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
                required={true}
                placeholder="e.g., Information Technology"
              />
              <FormField
                label="Designation"
                value={formData.designation}
                onChange={(value) =>
                  setFormData({ ...formData, designation: value })
                }
                required={true}
                placeholder="e.g., Software Developer"
              />
              <FormField
                label="Base Salary"
                value={formData.baseSalary}
                onChange={(value) =>
                  setFormData({ ...formData, baseSalary: value })
                }
                type="number"
                required={true}
                placeholder="e.g., 75000"
              />
              <FormField
                label="Allowances"
                value={formData.allowances}
                onChange={(value) =>
                  setFormData({ ...formData, allowances: value })
                }
                type="number"
                placeholder="e.g., 5000"
              />
              <FormField
                label="Date of Joining"
                value={formData.joinDate}
                onChange={(value) =>
                  setFormData({ ...formData, joinDate: value })
                }
                type="date"
                required={true}
              />
            </div>
          </TabPanel>

          {/* Private Info Tab */}
          <TabPanel value={activeTab} index={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(value) =>
                  setFormData({ ...formData, dateOfBirth: value })
                }
                type="date"
                required={true}
              />
              <FormField
                label="Residing Address"
                value={formData.residingAddress}
                onChange={(value) =>
                  setFormData({ ...formData, residingAddress: value })
                }
                required={true}
                placeholder="e.g., 123 Tech Street, Bangalore"
              />
              <FormField
                label="Nationality"
                value={formData.nationality}
                onChange={(value) =>
                  setFormData({ ...formData, nationality: value })
                }
                required={true}
                placeholder="e.g., Indian"
              />
              <FormField
                label="Personal Email"
                value={formData.personalEmail}
                onChange={(value) =>
                  setFormData({ ...formData, personalEmail: value })
                }
                type="email"
                placeholder="your.personal@email.com"
              />
              <FormField
                label="Gender"
                value={formData.gender}
                onChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                type="select"
                options={genderOptions}
                required={true}
              />
              <FormField
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={(value) =>
                  setFormData({ ...formData, maritalStatus: value })
                }
                type="select"
                options={maritalStatusOptions}
              />
            </div>
          </TabPanel>

          {/* Salary Info Tab */}
          <TabPanel value={activeTab} index={2}>
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                Bank Details
              </h3>
              <div className="space-y-4">
                <FormField
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, accountNumber: value })
                  }
                  sensitive={true}
                  placeholder="Enter your bank account number"
                />
                <FormField
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(value) =>
                    setFormData({ ...formData, bankName: value })
                  }
                  placeholder="e.g., State Bank of India"
                />
                <FormField
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={(value) =>
                    setFormData({ ...formData, ifscCode: value })
                  }
                  placeholder="e.g., SBIN0001234"
                />
              </div>
            </div>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="PAN No"
                value={formData.panNumber}
                onChange={(value) =>
                  setFormData({ ...formData, panNumber: value })
                }
                sensitive={true}
                placeholder="e.g., ABCDE1234F"
              />
              <FormField
                label="UAN NO"
                value={formData.uanNumber}
                onChange={(value) =>
                  setFormData({ ...formData, uanNumber: value })
                }
                sensitive={true}
                placeholder="Universal Account Number"
              />
              <FormField
                label="Emp Code"
                value={formData.empCode}
                onChange={(value) =>
                  setFormData({ ...formData, empCode: value })
                }
                placeholder="Employee Code (optional)"
              />
            </div>
          </TabPanel>
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeTab === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {activeTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isTabValid(0)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className="mr-1" />
                {loading ? "Creating Profile..." : "Complete Profile"}
              </button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Step {activeTab + 1} of {tabs.length}
          </div>
        </div>
      </form>
    </div>
  );
};
