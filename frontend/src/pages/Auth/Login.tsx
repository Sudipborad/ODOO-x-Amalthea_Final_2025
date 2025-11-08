import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Notification } from '../../components/ui/Notification';
import { AuthLayout } from './AuthLayout';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ 
    message: location.state?.message || '', 
    type: 'success', 
    isVisible: !!location.state?.message 
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/employees" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      setNotification({
        message: 'Login successful!',
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : 'Login failed',
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
        subtitle="Sign in to your account"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              required
            />

            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              to="/signup"
              className="font-medium text-blue-900 hover:text-blue-800 transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>
          <div className="text-center">
            <Link
              to="/company-signup"
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              Register your company
            </Link>
          </div>
        </div>
        
        {location.state?.userId && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Your Login ID:</strong> {location.state.userId}
            </p>
          </div>
        )}


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