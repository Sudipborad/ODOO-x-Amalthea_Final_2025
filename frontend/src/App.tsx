import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { Login, Signup, CompanySignup } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { EmployeesList } from './pages/Employees/EmployeesList';
import { EmployeeProfile } from './pages/Employees/EmployeeProfile';
import { EmployeeDetailPage } from './pages/Employees/EmployeeDetailPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { AttendanceManagementPage } from './pages/Attendance/AttendanceManagementPage';
import { TimeOffPage } from './pages/TimeOff/TimeOffPage';
import { PayrollPage } from './pages/Payroll/PayrollPage';
import { SalaryManagementPage } from './pages/Payroll/SalaryManagementPage';
import { PayslipsPage } from './pages/Payslips/PayslipsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { ReportsManagementPage } from './pages/Reports/ReportsManagementPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { SystemSettingsPage } from './pages/Settings/SystemSettingsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { MyProfile } from './pages/Profile/MyProfile';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/company-signup" element={user ? <Navigate to="/dashboard" replace /> : <CompanySignup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRole={["ADMIN", "HR"]}>
                <AppLayout>
                  <EmployeesList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id/details"
            element={
              <ProtectedRoute>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/management"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendanceManagementPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeoff"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TimeOffPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute requiredRole={["ADMIN", "PAYROLL"]}>
                <AppLayout>
                  <PayrollPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/salary-management"
            element={
              <ProtectedRoute requiredRole={["ADMIN", "PAYROLL"]}>
                <AppLayout>
                  <SalaryManagementPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payslips"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PayslipsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole={["ADMIN", "HR", "PAYROLL"]}>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/management"
            element={
              <ProtectedRoute requiredRole={["ADMIN", "HR", "PAYROLL"]}>
                <AppLayout>
                  <ReportsManagementPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/system"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <SystemSettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MyProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;