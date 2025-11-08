// Backend roles: ADMIN, HR, PAYROLL, EMPLOYEE
export type UserRole = 'ADMIN' | 'HR' | 'PAYROLL' | 'EMPLOYEE';

export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

export const canAccessEmployees = (role: UserRole): boolean => {
  return ['ADMIN', 'HR'].includes(role);
};

export const canAccessPayroll = (role: UserRole): boolean => {
  return ['ADMIN', 'PAYROLL'].includes(role);
};

export const canAccessReports = (role: UserRole): boolean => {
  return ['ADMIN', 'HR', 'PAYROLL'].includes(role);
};

export const canAccessSettings = (role: UserRole): boolean => {
  return role === 'ADMIN';
};

export const canApproveLeaves = (role: UserRole): boolean => {
  return ['ADMIN', 'HR', 'PAYROLL'].includes(role);
};

export const canManageTimeOff = (role: UserRole): boolean => {
  return ['ADMIN', 'HR', 'PAYROLL'].includes(role);
};