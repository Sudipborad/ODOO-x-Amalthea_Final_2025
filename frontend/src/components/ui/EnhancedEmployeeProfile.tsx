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
  Heart,
  Award,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface EmployeeProfile {
  id: number;
  user: {
    name: string;
    email: string;
    role: string;
  };
  department: string;
  designation: string;
  joinDate: string;
  baseSalary: number;
  // Personal Information
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  address?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // Government IDs
  panNumber?: string;
  aadharNumber?: string;
  esiNumber?: string;
  pfNumber?: string;
  uanNumber?: string;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  // Professional Information
  workLocation?: string;
  reportingManager?: string;
  employmentType?: string;
  workShift?: string;
  probationPeriod?: number;
  noticePeriod?: number;
  skills?: string[];
  certifications?: string[];
  // Health and Benefits
  bloodGroup?: string;
  medicalConditions?: string;
  healthInsuranceNumber?: string;
  // Additional fields
  manager?: {
    user: { name: string };
  };
}

interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon,
  children,
  className = "",
}) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    {children}
  </div>
);

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  sensitive?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  sensitive = false,
}) => {
  const [showSensitive, setShowSensitive] = useState(false);

  const displayValue =
    sensitive && !showSensitive ? "••••••••••" : value || "Not provided";

  return (
    <div className="flex items-center space-x-3 py-2">
      {icon && <div className="text-gray-400">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center space-x-2">
          <p className="font-medium text-gray-900">{displayValue}</p>
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
  );
};

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
  rows?: number;
  sensitive?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  options,
  rows,
  sensitive = false,
}) => {
  if (type === "select" && options) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
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

  if (type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows || 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {sensitive && (
          <Lock size={12} className="inline ml-1 text-yellow-500" />
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

interface EnhancedEmployeeProfileProps {
  employee: EmployeeProfile;
  canEdit: boolean;
  onUpdate: (updatedData: Partial<EmployeeProfile>) => Promise<void>;
}

export const EnhancedEmployeeProfile: React.FC<
  EnhancedEmployeeProfileProps
> = ({ employee, canEdit, onUpdate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    dateOfBirth: employee.dateOfBirth || "",
    gender: employee.gender || "",
    nationality: employee.nationality || "",
    maritalStatus: employee.maritalStatus || "",
    address: employee.address || "",
    phoneNumber: employee.phoneNumber || "",
    emergencyContactName: employee.emergencyContactName || "",
    emergencyContactPhone: employee.emergencyContactPhone || "",
    emergencyContactRelation: employee.emergencyContactRelation || "",
    // Government IDs
    panNumber: employee.panNumber || "",
    aadharNumber: employee.aadharNumber || "",
    esiNumber: employee.esiNumber || "",
    pfNumber: employee.pfNumber || "",
    uanNumber: employee.uanNumber || "",
    // Bank Details
    bankName: employee.bankName || "",
    accountNumber: employee.bankAccountNumber || "",
    ifscCode: employee.ifscCode || "",
    branchName: employee.branchName || "",
    // Professional Information
    workLocation: employee.workLocation || "",
    employmentType: employee.employmentType || "",
    workShift: employee.workShift || "",
    probationPeriod: employee.probationPeriod?.toString() || "",
    noticePeriod: employee.noticePeriod?.toString() || "",
    skills: employee.skills?.join(", ") || "",
    certifications: employee.certifications?.join(", ") || "",
    // Health and Benefits
    bloodGroup: employee.bloodGroup || "",
    medicalConditions: employee.medicalConditions || "",
    healthInsuranceNumber: employee.healthInsuranceNumber || "",
  });

  const canEditSensitiveInfo = user?.role === "ADMIN" || user?.role === "HR";

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        probationPeriod: formData.probationPeriod
          ? parseInt(formData.probationPeriod)
          : null,
        noticePeriod: formData.noticePeriod
          ? parseInt(formData.noticePeriod)
          : null,
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        certifications: formData.certifications
          ? formData.certifications
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
      };

      await onUpdate(updateData);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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

  const employmentTypeOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Intern", label: "Intern" },
  ];

  const workShiftOptions = [
    { value: "Day", label: "Day Shift" },
    { value: "Night", label: "Night Shift" },
    { value: "Rotational", label: "Rotational" },
    { value: "Flexible", label: "Flexible" },
  ];

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {employee.user.name}
          </h1>
          <p className="text-gray-600 mt-1">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personal Information */}
        <ProfileSection title="Personal Information" icon={<User size={20} />}>
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(value) =>
                  setFormData({ ...formData, dateOfBirth: value })
                }
              />
              <FormField
                label="Gender"
                type="select"
                value={formData.gender}
                onChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                options={genderOptions}
              />
              <FormField
                label="Nationality"
                value={formData.nationality}
                onChange={(value) =>
                  setFormData({ ...formData, nationality: value })
                }
              />
              <FormField
                label="Marital Status"
                type="select"
                value={formData.maritalStatus}
                onChange={(value) =>
                  setFormData({ ...formData, maritalStatus: value })
                }
                options={maritalStatusOptions}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Address"
                  type="textarea"
                  value={formData.address}
                  onChange={(value) =>
                    setFormData({ ...formData, address: value })
                  }
                  rows={2}
                />
              </div>
              <FormField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(value) =>
                  setFormData({ ...formData, phoneNumber: value })
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              <InfoRow
                label="Date of Birth"
                value={
                  employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toLocaleDateString()
                    : "Not provided"
                }
                icon={<Calendar size={16} />}
              />
              <InfoRow
                label="Gender"
                value={employee.gender || "Not provided"}
              />
              <InfoRow
                label="Nationality"
                value={employee.nationality || "Not provided"}
              />
              <InfoRow
                label="Marital Status"
                value={employee.maritalStatus || "Not provided"}
              />
              <InfoRow
                label="Address"
                value={employee.address || "Not provided"}
                icon={<MapPin size={16} />}
              />
              <InfoRow
                label="Phone Number"
                value={employee.phoneNumber || "Not provided"}
                icon={<Phone size={16} />}
              />
            </div>
          )}
        </ProfileSection>

        {/* Emergency Contact */}
        <ProfileSection title="Emergency Contact" icon={<Phone size={20} />}>
          {editing ? (
            <div className="space-y-4">
              <FormField
                label="Contact Name"
                value={formData.emergencyContactName}
                onChange={(value) =>
                  setFormData({ ...formData, emergencyContactName: value })
                }
              />
              <FormField
                label="Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(value) =>
                  setFormData({ ...formData, emergencyContactPhone: value })
                }
              />
              <FormField
                label="Relation"
                value={formData.emergencyContactRelation}
                onChange={(value) =>
                  setFormData({ ...formData, emergencyContactRelation: value })
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              <InfoRow
                label="Contact Name"
                value={employee.emergencyContactName || "Not provided"}
                icon={<User size={16} />}
              />
              <InfoRow
                label="Contact Phone"
                value={employee.emergencyContactPhone || "Not provided"}
                icon={<Phone size={16} />}
              />
              <InfoRow
                label="Relation"
                value={employee.emergencyContactRelation || "Not provided"}
              />
            </div>
          )}
        </ProfileSection>

        {/* Government IDs - Only for HR/Admin */}
        {canEditSensitiveInfo && (
          <ProfileSection title="Government IDs" icon={<FileText size={20} />}>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="PAN Number"
                  value={formData.panNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, panNumber: value })
                  }
                  sensitive
                />
                <FormField
                  label="Aadhar Number"
                  value={formData.aadharNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, aadharNumber: value })
                  }
                  sensitive
                />
                <FormField
                  label="ESI Number"
                  value={formData.esiNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, esiNumber: value })
                  }
                  sensitive
                />
                <FormField
                  label="PF Number"
                  value={formData.pfNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, pfNumber: value })
                  }
                  sensitive
                />
                <FormField
                  label="UAN Number"
                  value={formData.uanNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, uanNumber: value })
                  }
                  sensitive
                />
              </div>
            ) : (
              <div className="space-y-2">
                <InfoRow
                  label="PAN Number"
                  value={employee.panNumber || "Not provided"}
                  icon={<FileText size={16} />}
                  sensitive
                />
                <InfoRow
                  label="Aadhar Number"
                  value={employee.aadharNumber || "Not provided"}
                  icon={<FileText size={16} />}
                  sensitive
                />
                <InfoRow
                  label="ESI Number"
                  value={employee.esiNumber || "Not provided"}
                  icon={<FileText size={16} />}
                  sensitive
                />
                <InfoRow
                  label="PF Number"
                  value={employee.pfNumber || "Not provided"}
                  icon={<FileText size={16} />}
                  sensitive
                />
                <InfoRow
                  label="UAN Number"
                  value={employee.uanNumber || "Not provided"}
                  icon={<FileText size={16} />}
                  sensitive
                />
              </div>
            )}
          </ProfileSection>
        )}

        {/* Bank Details - Only for HR/Admin */}
        {canEditSensitiveInfo && (
          <ProfileSection title="Bank Details" icon={<CreditCard size={20} />}>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(value) =>
                    setFormData({ ...formData, bankName: value })
                  }
                />
                <FormField
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(value) =>
                    setFormData({ ...formData, accountNumber: value })
                  }
                  sensitive
                />
                <FormField
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={(value) =>
                    setFormData({ ...formData, ifscCode: value })
                  }
                />
                <FormField
                  label="Branch Name"
                  value={formData.branchName}
                  onChange={(value) =>
                    setFormData({ ...formData, branchName: value })
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <InfoRow
                  label="Bank Name"
                  value={employee.bankName || "Not provided"}
                  icon={<Building size={16} />}
                />
                <InfoRow
                  label="Account Number"
                  value={employee.accountNumber || "Not provided"}
                  icon={<CreditCard size={16} />}
                  sensitive
                />
                <InfoRow
                  label="IFSC Code"
                  value={employee.ifscCode || "Not provided"}
                />
                <InfoRow
                  label="Branch Name"
                  value={employee.branchName || "Not provided"}
                  icon={<MapPin size={16} />}
                />
              </div>
            )}
          </ProfileSection>
        )}

        {/* Professional Information */}
        <ProfileSection
          title="Professional Information"
          icon={<Briefcase size={20} />}
        >
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Work Location"
                value={formData.workLocation}
                onChange={(value) =>
                  setFormData({ ...formData, workLocation: value })
                }
              />
              <FormField
                label="Employment Type"
                type="select"
                value={formData.employmentType}
                onChange={(value) =>
                  setFormData({ ...formData, employmentType: value })
                }
                options={employmentTypeOptions}
              />
              <FormField
                label="Work Shift"
                type="select"
                value={formData.workShift}
                onChange={(value) =>
                  setFormData({ ...formData, workShift: value })
                }
                options={workShiftOptions}
              />
              <FormField
                label="Probation Period (months)"
                type="number"
                value={formData.probationPeriod}
                onChange={(value) =>
                  setFormData({ ...formData, probationPeriod: value })
                }
              />
              <FormField
                label="Notice Period (days)"
                type="number"
                value={formData.noticePeriod}
                onChange={(value) =>
                  setFormData({ ...formData, noticePeriod: value })
                }
              />
              <div className="md:col-span-2">
                <FormField
                  label="Skills (comma-separated)"
                  value={formData.skills}
                  onChange={(value) =>
                    setFormData({ ...formData, skills: value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Certifications (comma-separated)"
                  value={formData.certifications}
                  onChange={(value) =>
                    setFormData({ ...formData, certifications: value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <InfoRow
                label="Department"
                value={employee.department}
                icon={<Building size={16} />}
              />
              <InfoRow
                label="Designation"
                value={employee.designation}
                icon={<Briefcase size={16} />}
              />
              <InfoRow
                label="Work Location"
                value={employee.workLocation || "Not provided"}
                icon={<MapPin size={16} />}
              />
              <InfoRow
                label="Employment Type"
                value={employee.employmentType || "Not provided"}
              />
              <InfoRow
                label="Work Shift"
                value={employee.workShift || "Not provided"}
              />
              <InfoRow
                label="Reporting Manager"
                value={employee.manager?.user.name || "Not assigned"}
                icon={<User size={16} />}
              />
              <InfoRow
                label="Join Date"
                value={new Date(employee.joinDate).toLocaleDateString()}
                icon={<Calendar size={16} />}
              />
              {employee.probationPeriod && (
                <InfoRow
                  label="Probation Period"
                  value={`${employee.probationPeriod} months`}
                />
              )}
              {employee.noticePeriod && (
                <InfoRow
                  label="Notice Period"
                  value={`${employee.noticePeriod} days`}
                />
              )}
              {employee.skills && employee.skills.length > 0 && (
                <div className="py-2">
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {employee.certifications &&
                employee.certifications.length > 0 && (
                  <div className="py-2">
                    <p className="text-sm text-gray-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"
                        >
                          <Award size={12} className="mr-1" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </ProfileSection>

        {/* Health and Benefits */}
        <ProfileSection title="Health & Benefits" icon={<Heart size={20} />}>
          {editing ? (
            <div className="space-y-4">
              <FormField
                label="Blood Group"
                type="select"
                value={formData.bloodGroup}
                onChange={(value) =>
                  setFormData({ ...formData, bloodGroup: value })
                }
                options={bloodGroupOptions}
              />
              <FormField
                label="Medical Conditions"
                type="textarea"
                value={formData.medicalConditions}
                onChange={(value) =>
                  setFormData({ ...formData, medicalConditions: value })
                }
                rows={2}
              />
              <FormField
                label="Health Insurance Number"
                value={formData.healthInsuranceNumber}
                onChange={(value) =>
                  setFormData({ ...formData, healthInsuranceNumber: value })
                }
                sensitive
              />
            </div>
          ) : (
            <div className="space-y-2">
              <InfoRow
                label="Blood Group"
                value={employee.bloodGroup || "Not provided"}
                icon={<Heart size={16} />}
              />
              <InfoRow
                label="Medical Conditions"
                value={employee.medicalConditions || "None reported"}
              />
              <InfoRow
                label="Health Insurance Number"
                value={employee.healthInsuranceNumber || "Not provided"}
                sensitive
              />
            </div>
          )}
        </ProfileSection>

        {/* Employment Summary */}
        <ProfileSection
          title="Employment Summary"
          icon={<Building size={20} />}
          className="xl:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                ₹{employee.baseSalary.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Base Salary</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(
                  (Date.now() - new Date(employee.joinDate).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )}
              </p>
              <p className="text-sm text-gray-600">Years of Service</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {employee.skills?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Skills</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">
                {employee.certifications?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Certifications</p>
            </div>
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};
