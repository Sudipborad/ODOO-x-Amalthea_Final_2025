import React, { useState } from 'react';
import { User, CreditCard, FileText, Award, Star, DollarSign, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';

interface Employee {
  id: number;
  user: {
    name: string;
    email: string;
  };
  department: string;
  designation: string;
  joinDate: string;
  baseSalary: number;
  allowances: number;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  phone?: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  aadharNumber?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  accountHolderName?: string;
  accountType?: string;
  resumePath?: string;
  manager?: {
    user: { name: string };
  };
  skills: Array<{
    id: number;
    name: string;
    proficiency: string;
  }>;
  certifications: Array<{
    id: number;
    name: string;
    issueDate: string;
    validityDate?: string;
  }>;
  payrunLines: Array<{
    gross: number;
    net: number;
    payrun: {
      periodStart: string;
      periodEnd: string;
    };
  }>;
}

interface EmployeeProfileTabsProps {
  employeeId: string;
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
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const AboutTab: React.FC<{ employee: Employee }> = ({ employee }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <User className="text-gray-400" size={20} />
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{employee.user.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Mail className="text-gray-400" size={20} />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{employee.user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="text-gray-400" size={20} />
          <div>
            <p className="text-sm text-gray-500">Join Date</p>
            <p className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <User className="text-gray-400" size={20} />
          <div>
            <p className="text-sm text-gray-500">Manager</p>
            <p className="font-medium">{employee.manager?.user.name || 'Not assigned'}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Work Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Department</p>
          <p className="font-medium">{employee.department}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Designation</p>
          <p className="font-medium">{employee.designation}</p>
        </div>
      </div>
    </div>
  </div>
);

const PrivateInfoTab: React.FC<{ employee: Employee; onUpdate: (data: any) => void }> = ({ employee, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: employee.dateOfBirth || '',
    address: employee.address || '',
    gender: employee.gender || '',
    nationality: employee.nationality || '',
    maritalStatus: employee.maritalStatus || '',
    phone: employee.phone || '',
    alternatePhone: employee.alternatePhone || '',
    emergencyContactName: employee.emergencyContactName || '',
    emergencyContactPhone: employee.emergencyContactPhone || '',
    emergencyContactRelation: employee.emergencyContactRelation || '',
    aadharNumber: employee.aadharNumber || '',
    panNumber: employee.panNumber || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/employee-profile/${employee.id}/personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onUpdate(formData);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Private Information</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Primary phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alternate phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
              <input
                type="text"
                value={formData.aadharNumber}
                onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12-digit Aadhar number"
                maxLength={12}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>
            <div className="md:col-span-2">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
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
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{employee.gender || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{employee.address || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nationality</p>
            <p className="font-medium">{employee.nationality || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Marital Status</p>
            <p className="font-medium">{employee.maritalStatus || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{employee.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alternate Phone</p>
            <p className="font-medium">{employee.alternatePhone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Aadhar Number</p>
            <p className="font-medium">{employee.aadharNumber ? `****${employee.aadharNumber.slice(-4)}` : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">PAN Number</p>
            <p className="font-medium">{employee.panNumber || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
          </div>
          <div>
            <p className="text-sm text-gray-500">Emergency Contact Name</p>
            <p className="font-medium">{employee.emergencyContactName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Emergency Contact Phone</p>
            <p className="font-medium">{employee.emergencyContactPhone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Relation</p>
            <p className="font-medium">{employee.emergencyContactRelation || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const BankDetailsTab: React.FC<{ employee: Employee; onUpdate: (data: any) => void }> = ({ employee, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bankAccountNumber: employee.bankAccountNumber || '',
    bankName: employee.bankName || '',
    ifscCode: employee.ifscCode || '',
    accountHolderName: employee.accountHolderName || '',
    accountType: employee.accountType || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/employee-profile/${employee.id}/bank`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onUpdate(formData);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bank Details</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Account holder name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="IFSC code"
                maxLength={11}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account Type</option>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
                <option value="SALARY">Salary</option>
              </select>
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
            <p className="text-sm text-gray-500">Account Number</p>
            <p className="font-medium">{employee.bankAccountNumber ? `****${employee.bankAccountNumber.slice(-4)}` : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Holder Name</p>
            <p className="font-medium">{employee.accountHolderName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="font-medium">{employee.bankName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">IFSC Code</p>
            <p className="font-medium">{employee.ifscCode || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="font-medium">{employee.accountType || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SalaryInfoTab: React.FC<{ employee: Employee }> = ({ employee }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Current Salary Structure</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-500">Monthly Wage</p>
          <p className="text-2xl font-bold text-blue-600">₹{employee.baseSalary.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-500">Yearly Wage</p>
          <p className="text-2xl font-bold text-green-600">₹{(employee.baseSalary * 12).toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-500">Allowances</p>
          <p className="text-2xl font-bold text-purple-600">₹{employee.allowances.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Salary History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payslip</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employee.payrunLines.map((payrun, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payrun.payrun.periodStart).toLocaleDateString()} - {new Date(payrun.payrun.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payrun.gross.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payrun.net.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <button className="hover:underline">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const EmployeeProfileTabs: React.FC<EmployeeProfileTabsProps> = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('about');
  const { data: employee, loading, refetch } = useFetch<Employee>(`/api/employee-profile/${employeeId}`);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!employee) {
    return <div className="text-center p-8 text-gray-500">Employee not found</div>;
  }

  const tabs = [
    { id: 'about', label: 'About', icon: <User size={16} /> },
    { id: 'private', label: 'Private Info', icon: <User size={16} /> },
    { id: 'bank', label: 'Bank Details', icon: <CreditCard size={16} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Star size={16} /> },
    { id: 'certifications', label: 'Certifications', icon: <Award size={16} /> },
    { id: 'salary', label: 'Salary Info', icon: <DollarSign size={16} /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab employee={employee} />;
      case 'private':
        return <PrivateInfoTab employee={employee} onUpdate={refetch} />;
      case 'bank':
        return <BankDetailsTab employee={employee} onUpdate={refetch} />;
      case 'salary':
        return <SalaryInfoTab employee={employee} />;
      default:
        return <div className="text-center p-8 text-gray-500">Content coming soon...</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
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
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};