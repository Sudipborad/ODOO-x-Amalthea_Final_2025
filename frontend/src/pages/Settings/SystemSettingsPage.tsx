import React, { useState } from "react";
import { FormField } from "../../components/ui/FormField";

interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  currency: string;
  timezone: string;
}

interface PayrollSettings {
  payPeriod: string;
  payDay: string;
  overtimeRate: number;
  pfRate: number;
  professionalTax: number;
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
}

interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  lateThreshold: number;
  halfDayThreshold: number;
  autoClockOut: boolean;
  weekendWork: boolean;
}

export const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("company");

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>({
    payPeriod: "",
    payDay: "",
    overtimeRate: 0,
    pfRate: 0,
    professionalTax: 0,
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
  });

  const [attendanceSettings, setAttendanceSettings] =
    useState<AttendanceSettings>({
      workStartTime: "",
      workEndTime: "",
      lateThreshold: 0,
      halfDayThreshold: 0,
      autoClockOut: false,
      weekendWork: false,
    });

  const tabs = [
    { id: "company", label: "Company Info", icon: "🏢" },
    { id: "payroll", label: "Payroll Settings", icon: "💰" },
    { id: "attendance", label: "Attendance Rules", icon: "⏰" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ];

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
  ];

  const timezones = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  ];

  const payPeriods = [
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
  ];

  const handleSave = () => {
    // Save settings logic here
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure your HRMS system preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === "company" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Company Name"
                    value={companySettings.companyName}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        companyName: value,
                      }))
                    }
                    required
                  />
                  <FormField
                    label="Tax ID"
                    value={companySettings.taxId}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({ ...prev, taxId: value }))
                    }
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Address"
                      type="textarea"
                      value={companySettings.address}
                      onChange={(value) =>
                        setCompanySettings((prev) => ({
                          ...prev,
                          address: value,
                        }))
                      }
                    />
                  </div>
                  <FormField
                    label="Phone"
                    value={companySettings.phone}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({ ...prev, phone: value }))
                    }
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={companySettings.email}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({ ...prev, email: value }))
                    }
                  />
                  <FormField
                    label="Website"
                    value={companySettings.website}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        website: value,
                      }))
                    }
                  />
                  <FormField
                    label="Currency"
                    type="select"
                    value={companySettings.currency}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        currency: value,
                      }))
                    }
                    options={currencies}
                  />
                  <FormField
                    label="Timezone"
                    type="select"
                    value={companySettings.timezone}
                    onChange={(value) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        timezone: value,
                      }))
                    }
                    options={timezones}
                  />
                </div>
              </div>
            )}

            {activeTab === "payroll" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Payroll Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Pay Period"
                    type="select"
                    value={payrollSettings.payPeriod}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        payPeriod: value,
                      }))
                    }
                    options={payPeriods}
                  />
                  <FormField
                    label="Pay Day (Day of Month)"
                    type="number"
                    value={payrollSettings.payDay}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({ ...prev, payDay: value }))
                    }
                  />
                  <FormField
                    label="Overtime Rate (Multiplier)"
                    type="number"
                    value={payrollSettings.overtimeRate.toString()}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        overtimeRate: parseFloat(value) || 1.5,
                      }))
                    }
                  />
                  <FormField
                    label="PF Rate (%)"
                    type="number"
                    value={payrollSettings.pfRate.toString()}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        pfRate: parseFloat(value) || 12,
                      }))
                    }
                  />
                  <FormField
                    label="Professional Tax (₹)"
                    type="number"
                    value={payrollSettings.professionalTax.toString()}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        professionalTax: parseFloat(value) || 200,
                      }))
                    }
                  />
                  <FormField
                    label="Working Hours Per Day"
                    type="number"
                    value={payrollSettings.workingHoursPerDay.toString()}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        workingHoursPerDay: parseFloat(value) || 8,
                      }))
                    }
                  />
                  <FormField
                    label="Working Days Per Week"
                    type="number"
                    value={payrollSettings.workingDaysPerWeek.toString()}
                    onChange={(value) =>
                      setPayrollSettings((prev) => ({
                        ...prev,
                        workingDaysPerWeek: parseFloat(value) || 5,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Attendance Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Work Start Time"
                    type="time"
                    value={attendanceSettings.workStartTime}
                    onChange={(value) =>
                      setAttendanceSettings((prev) => ({
                        ...prev,
                        workStartTime: value,
                      }))
                    }
                  />
                  <FormField
                    label="Work End Time"
                    type="time"
                    value={attendanceSettings.workEndTime}
                    onChange={(value) =>
                      setAttendanceSettings((prev) => ({
                        ...prev,
                        workEndTime: value,
                      }))
                    }
                  />
                  <FormField
                    label="Late Threshold (minutes)"
                    type="number"
                    value={attendanceSettings.lateThreshold.toString()}
                    onChange={(value) =>
                      setAttendanceSettings((prev) => ({
                        ...prev,
                        lateThreshold: parseInt(value) || 15,
                      }))
                    }
                  />
                  <FormField
                    label="Half Day Threshold (hours)"
                    type="number"
                    value={attendanceSettings.halfDayThreshold.toString()}
                    onChange={(value) =>
                      setAttendanceSettings((prev) => ({
                        ...prev,
                        halfDayThreshold: parseInt(value) || 4,
                      }))
                    }
                  />
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoClockOut"
                        checked={attendanceSettings.autoClockOut}
                        onChange={(e) =>
                          setAttendanceSettings((prev) => ({
                            ...prev,
                            autoClockOut: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="autoClockOut"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Auto clock-out at end of work day
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="weekendWork"
                        checked={attendanceSettings.weekendWork}
                        onChange={(e) =>
                          setAttendanceSettings((prev) => ({
                            ...prev,
                            weekendWork: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="weekendWork"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Allow weekend work
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "notifications" ||
              activeTab === "security" ||
              activeTab === "integrations") && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tabs.find((t) => t.id === activeTab)?.label} Settings
                </h3>
                <p className="text-gray-600">
                  This section is under development and will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
