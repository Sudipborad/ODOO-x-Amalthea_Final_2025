import React, { useState } from 'react';
import { FormField } from '../../components/ui/FormField';
import { Notification } from '../../components/ui/Notification';

export const CompleteProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bankAccount: '',
    department: '',
    designation: '',
    newPassword: '',
    confirmPassword: '',
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
    
    if (!formData.name || !formData.phone || !formData.address || !formData.department || !formData.designation || !formData.bankAccount || !formData.newPassword) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          department: formData.department,
          designation: formData.designation,
          bankAccount: formData.bankAccount,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Profile submitted for admin review! Your employee ID is: ${data.userId}`, 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        showNotification(data.error || 'Failed to complete profile', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please complete your profile and set a new password
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormField
              label="Full Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              required
              placeholder="Enter your full name"
            />
            
            <FormField
              label="Phone Number"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              required
              placeholder="+1234567890"
            />
            
            <FormField
              label="Address"
              type="textarea"
              value={formData.address}
              onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
              required
              placeholder="Full address"
            />
            
            <FormField
              label="Department"
              value={formData.department}
              onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              required
              placeholder="e.g. Engineering, HR, Finance"
            />
            
            <FormField
              label="Designation"
              value={formData.designation}
              onChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
              required
              placeholder="e.g. Software Developer, Manager"
            />
            
            <FormField
              label="Bank Account (Last 4 digits)"
              value={formData.bankAccount}
              onChange={(value) => setFormData(prev => ({ ...prev, bankAccount: value }))}
              required
              placeholder="****1234"
              maxLength={4}
            />
            
            <FormField
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, newPassword: value }))}
              required
              placeholder="Minimum 6 characters"
            />
            
            <FormField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Your temporary password will be replaced</li>
              <li>• A permanent employee ID will be generated</li>
              <li>• You can update other details later in your profile</li>
            </ul>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Profile
          </button>
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