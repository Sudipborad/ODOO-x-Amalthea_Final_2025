import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Notification } from '../../components/ui/Notification';
import { AuthLayout } from './AuthLayout';

export const Signup: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  if (user) {
    return <Navigate to="/employees" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setNotification({
        message: 'Please fill in all required fields',
        type: 'error',
        isVisible: true,
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        message: 'Passwords do not match',
        type: 'error',
        isVisible: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotification({
        message: 'Account created successfully! Please sign in.',
        type: 'success',
        isVisible: true,
      });
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setNotification({
        message: 'Signup failed. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthLayout 
        title="WorkZen HRMS" 
        subtitle="Create your account to get started"
        maxWidth="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="Full Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter your full name"
              required
            />

            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                placeholder="Create a password"
                required
              />

              <FormField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

        <div className="mt-6">
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-900 hover:text-blue-800 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            <strong>Note:</strong> This is a demo application. Account creation is simulated for demonstration purposes.
          </p>
        </div>
      </AuthLayout>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};