import React, { useState } from 'react';
import { FormField } from '../../components/ui/FormField';
import { Notification } from '../../components/ui/Notification';

interface AddEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: any) => Promise<void>;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    temporaryPassword: '',
    role: 'EMPLOYEE',
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, isVisible: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.temporaryPassword) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (formData.temporaryPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      console.log('Submitting employee data:', formData);
      await onSubmit(formData);
      showNotification('Employee created successfully! Send credentials to the employee.', 'success');
      
      // Reset form
      setFormData({
        email: '',
        temporaryPassword: '',
        role: 'EMPLOYEE',
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      showNotification(`Failed to create employee: ${error.message || 'Please try again'}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Create employee account with temporary credentials. Employee will complete their profile after first login.
              </p>
            </div>
            
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              required
              placeholder="employee@company.com"
            />
            
            <FormField
              label="Temporary Password"
              type="password"
              value={formData.temporaryPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, temporaryPassword: value }))}
              required
              placeholder="Minimum 6 characters"
            />
            
            <FormField
              label="Role"
              type="select"
              value={formData.role}
              onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'HR', label: 'HR Officer' },
                { value: 'PAYROLL', label: 'Payroll Officer' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
              required
            />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Send login credentials to the employee</li>
                <li>• Employee logs in with temporary password</li>
                <li>• Employee completes profile and sets new password</li>
                <li>• System generates permanent employee ID</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Employee Account
            </button>
          </div>
        </form>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};