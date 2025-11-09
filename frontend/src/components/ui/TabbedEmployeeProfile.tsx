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
  CreditCard,
  FileText,
  Shield,
  DollarSign,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import {
  formatDate,
  formatDateForInput,
  formatCurrency,
} from "../../utils/dateUtils";

interface EmployeeProfileData {
  id: number;
  user: {
    name: string;
    email: string;
    role: string;
  };
  // Resume Tab
  department: string;
  designation: string;
  joinDate: string;
  baseSalary: number;
  // Private Info Tab
  dateOfBirth?: string;
  residingAddress?: string;
  nationality?: string;
  personalEmail?: string;
  gender?: string;
  maritalStatus?: string;
  // Salary Info Tab
  bankName?: string;
  accountNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  // Security Tab
  panNumber?: string;
  uanNumber?: string;
  empCode?: string;
  employeeCode?: string;
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
  editing: boolean;
  sensitive?: boolean;
  options?: { value: string; label: string }[];
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  editing,
  sensitive = false,
  options,
}) => {
  const [showSensitive, setShowSensitive] = useState(false);

  if (editing) {
    if (type === "select" && options) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {sensitive && (
              <Lock size={12} className="inline ml-1 text-yellow-500" />
            )}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

    // For date inputs, use the formatted value
    const inputValue = type === "date" ? formatDateForInput(value) : value;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {sensitive && (
            <Lock size={12} className="inline ml-1 text-yellow-500" />
          )}
        </label>
        <input
          type={type}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  // Display mode with proper formatting
  let displayValue = value || "Not provided";

  if (sensitive && !showSensitive && value) {
    displayValue = "••••••••••";
  } else if (type === "date" && value) {
    displayValue = formatDate(value);
  } else if (
    label.toLowerCase().includes("salary") &&
    value &&
    !isNaN(Number(value))
  ) {
    displayValue = formatCurrency(Number(value));
  }

  return (
    <div className="mb-4 pb-2 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {label}
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium">{displayValue}</span>
            {sensitive && value && (
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TabbedEmployeeProfileProps {
  employee: EmployeeProfileData;
  canEdit: boolean;
  onUpdate: (updatedData: Partial<EmployeeProfileData>) => Promise<void>;
}

export const TabbedEmployeeProfile: React.FC<TabbedEmployeeProfileProps> = ({
  employee,
  canEdit,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Resume
    department: employee.department || "",
    designation: employee.designation || "",
    joinDate: employee.joinDate || "",
    baseSalary: employee.baseSalary?.toString() || "",
    // Private Info
    dateOfBirth: employee.dateOfBirth || "",
    residingAddress: employee.residingAddress || "",
    nationality: employee.nationality || "",
    personalEmail: employee.personalEmail || "",
    gender: employee.gender || "",
    maritalStatus: employee.maritalStatus || "",
    // Salary Info
    bankName: employee.bankName || "",
    accountNumber: employee.accountNumber || "",
    ifscCode: employee.ifscCode || "",
    // Security
    panNumber: employee.panNumber || "",
    uanNumber: employee.uanNumber || "",
    empCode: employee.empCode || "",
  });

  const tabs = [
    { id: 0, label: "Resume", icon: <FileText size={16} /> },
    { id: 1, label: "Private Info", icon: <User size={16} /> },
    { id: 2, label: "Salary Info", icon: <DollarSign size={16} /> },
    { id: 3, label: "Security", icon: <Shield size={16} /> },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("=== PROFILE UPDATE DEBUG ===");
      console.log("Current employee data:", employee);
      console.log("Current form data:", formData);
      console.log("Account number from form:", formData.accountNumber);
      console.log("Employee code from form:", formData.empCode);

      // Validate IFSC code format if provided
      if (formData.ifscCode && formData.ifscCode !== "") {
        const ifscPattern = /^[A-Z]{4}[0-9A-Z]{7}$/i;
        if (!ifscPattern.test(formData.ifscCode.trim())) {
          alert(
            "Invalid IFSC code format. Please enter a valid 11-character IFSC code (e.g., SBIN0001234)"
          );
          setLoading(false);
          return;
        }
      }

      // Validate PAN number format if provided
      if (formData.panNumber && formData.panNumber !== "") {
        const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
        if (!panPattern.test(formData.panNumber.trim())) {
          alert(
            "Invalid PAN number format. Please enter a valid 10-character PAN number (e.g., ABCDE1234F)"
          );
          setLoading(false);
          return;
        }
      }

      // Clean and validate data before sending - only use fields available in formData
      const updateData = {
        // Basic fields
        department: formData.department || undefined,
        designation: formData.designation || undefined,
        baseSalary: formData.baseSalary
          ? parseFloat(formData.baseSalary)
          : undefined,
        // Date fields - only send if valid
        dateOfBirth:
          formData.dateOfBirth && formData.dateOfBirth !== ""
            ? formData.dateOfBirth
            : undefined,
        joinDate:
          formData.joinDate && formData.joinDate !== ""
            ? formData.joinDate
            : undefined,
        // Personal info
        residingAddress:
          formData.residingAddress && formData.residingAddress !== ""
            ? formData.residingAddress
            : undefined,
        nationality:
          formData.nationality && formData.nationality !== ""
            ? formData.nationality
            : undefined,
        personalEmail:
          formData.personalEmail && formData.personalEmail !== ""
            ? formData.personalEmail
            : undefined,
        gender:
          formData.gender && formData.gender !== ""
            ? formData.gender
            : undefined,
        maritalStatus:
          formData.maritalStatus && formData.maritalStatus !== ""
            ? formData.maritalStatus
            : undefined,
        // Banking info
        bankName:
          formData.bankName && formData.bankName !== ""
            ? formData.bankName
            : undefined,
        accountNumber:
          formData.accountNumber && formData.accountNumber !== ""
            ? formData.accountNumber
            : undefined,
        ifscCode:
          formData.ifscCode && formData.ifscCode !== ""
            ? formData.ifscCode.toUpperCase().trim()
            : undefined,
        // Security fields
        panNumber:
          formData.panNumber && formData.panNumber !== ""
            ? formData.panNumber.toUpperCase().trim()
            : undefined,
        uanNumber:
          formData.uanNumber && formData.uanNumber !== ""
            ? formData.uanNumber
            : undefined,
        empCode:
          formData.empCode && formData.empCode !== ""
            ? formData.empCode
            : undefined,
      };

      // Remove undefined values to avoid sending them
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      console.log("Final cleaned data being sent:", cleanedData);
      console.log("Account number in cleaned data:", cleanedData.accountNumber);
      console.log("Employee code in cleaned data:", cleanedData.empCode);

      await onUpdate(cleanedData);

      setEditing(false);
      alert("Profile updated successfully!");

      // Force immediate refetch to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      alert(`Failed to update profile: ${errorMessage}`);
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

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {employee.user.name}
            </h2>
            <p className="text-gray-600">
              {employee.designation} • {employee.department}
            </p>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                  >
                    <Save size={16} className="mr-1" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50"
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
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
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
              editing={editing}
            />
            <FormField
              label="Designation"
              value={formData.designation}
              onChange={(value) =>
                setFormData({ ...formData, designation: value })
              }
              editing={editing}
            />
            <FormField
              label="Date of Joining"
              value={formData.joinDate}
              onChange={(value) =>
                setFormData({ ...formData, joinDate: value })
              }
              type="date"
              editing={editing}
            />
            <FormField
              label="Base Salary"
              value={formData.baseSalary}
              onChange={(value) =>
                setFormData({ ...formData, baseSalary: value })
              }
              type="number"
              editing={editing}
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
              editing={editing}
            />
            <FormField
              label="Residing Address"
              value={formData.residingAddress}
              onChange={(value) =>
                setFormData({ ...formData, residingAddress: value })
              }
              editing={editing}
            />
            <FormField
              label="Nationality"
              value={formData.nationality}
              onChange={(value) =>
                setFormData({ ...formData, nationality: value })
              }
              editing={editing}
            />
            <FormField
              label="Personal Email"
              value={formData.personalEmail}
              onChange={(value) =>
                setFormData({ ...formData, personalEmail: value })
              }
              type="email"
              editing={editing}
            />
            <FormField
              label="Gender"
              value={formData.gender}
              onChange={(value) => setFormData({ ...formData, gender: value })}
              type="select"
              options={genderOptions}
              editing={editing}
            />
            <FormField
              label="Marital Status"
              value={formData.maritalStatus}
              onChange={(value) =>
                setFormData({ ...formData, maritalStatus: value })
              }
              type="select"
              options={maritalStatusOptions}
              editing={editing}
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
                editing={editing}
                sensitive={true}
              />
              <FormField
                label="Bank Name"
                value={formData.bankName}
                onChange={(value) =>
                  setFormData({ ...formData, bankName: value })
                }
                editing={editing}
              />
              <FormField
                label="IFSC Code"
                value={formData.ifscCode}
                onChange={(value) =>
                  setFormData({ ...formData, ifscCode: value })
                }
                editing={editing}
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
              editing={editing}
              sensitive={true}
            />
            <FormField
              label="UAN NO"
              value={formData.uanNumber}
              onChange={(value) =>
                setFormData({ ...formData, uanNumber: value })
              }
              editing={editing}
              sensitive={true}
            />
            <FormField
              label="Emp Code"
              value={formData.empCode}
              onChange={(value) => setFormData({ ...formData, empCode: value })}
              editing={editing}
            />
          </div>
        </TabPanel>
      </div>
    </div>
  );
};
