import axiosClient from './axiosClient';
import { UserRole } from '../utils/roleUtils';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
}

export interface Employee extends User {
  hireDate: string;
  salary: number;
  phone: string;
  address: string;
}

export interface TimeOffRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

// Authentication
export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await axiosClient.get('/employees');
  return response.data.employees || [];
};

export const getAllEmployees = async (): Promise<any[]> => {
  const response = await axiosClient.get('/employees');
  return response.data.employees || [];
};

export const getEmployee = async (id: number): Promise<Employee> => {
  const response = await axiosClient.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData: { email: string; temporaryPassword: string; role: string }): Promise<any> => {
  try {
    const response = await axiosClient.post('/users/create', employeeData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to create employee');
  }
};

// Attendance
export const getAttendance = async (params?: { from?: string; to?: string; employeeId?: number; limit?: number }): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.employeeId) queryParams.append('employeeId', params.employeeId.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = queryParams.toString() ? `/attendance?${queryParams.toString()}` : '/attendance';
  const response = await axiosClient.get(url);
  return response.data;
};

export const getTodayAttendance = async (): Promise<any> => {
  const response = await axiosClient.get('/attendance/today');
  return response.data;
};

export const clockIn = async (): Promise<void> => {
  await axiosClient.post('/attendance/clock-in');
};

export const clockOut = async (): Promise<void> => {
  await axiosClient.post('/attendance/clock-out');
};

// Time Off
export const getTimeOffRequests = async (): Promise<TimeOffRequest[]> => {
  const response = await axiosClient.get('/timeoff');
  return response.data.timeOffRequests || [];
};

export const submitTimeOffRequest = async (request: Omit<TimeOffRequest, 'id' | 'status' | 'submittedDate'>): Promise<void> => {
  // Convert date strings to ISO8601 format
  // HTML date inputs return YYYY-MM-DD, but backend expects ISO8601 with time
  const convertToISO8601 = (dateString: string): string => {
    if (!dateString) return dateString;
    // If already in ISO8601 format, return as is
    if (dateString.includes('T')) return dateString;
    // Convert YYYY-MM-DD to ISO8601 format at midnight UTC
    // This ensures the date is preserved regardless of timezone
    return `${dateString}T00:00:00.000Z`;
  };

  // Transform frontend format to backend format
  const backendRequest = {
    fromDate: convertToISO8601(request.startDate),
    toDate: convertToISO8601(request.endDate),
    type: request.type,
    reason: request.reason
  };
  await axiosClient.post('/timeoff', backendRequest);
};

export const approveTimeOffRequest = async (id: number): Promise<void> => {
  await axiosClient.put(`/timeoff/${id}/approve`);
};

export const rejectTimeOffRequest = async (id: number): Promise<void> => {
  await axiosClient.put(`/timeoff/${id}/reject`);
};

// Payroll
export const getPayruns = async (): Promise<any> => {
  const response = await axiosClient.get('/payroll');
  return response.data;
};

export const getPayrun = async (id: number): Promise<any> => {
  const response = await axiosClient.get(`/payroll/${id}`);
  return response.data;
};

export const computePayrollDraft = async (periodStart: string, periodEnd: string): Promise<any> => {
  const response = await axiosClient.post('/payroll/compute', { 
    periodStart, 
    periodEnd 
  });
  return response.data;
};

export const finalizePayroll = async (periodStart: string, periodEnd: string, payrollData?: any[]): Promise<any> => {
  const response = await axiosClient.post('/payroll/finalize', { 
    periodStart, 
    periodEnd, 
    payrollData 
  });
  return response.data;
};

// Payslips
export const getPayslips = async (employeeId?: number): Promise<any[]> => {
  const url = employeeId ? `/payslips?employeeId=${employeeId}` : '/payslips';
  const response = await axiosClient.get(url);
  return response.data.payslips || [];
};

export const downloadPayslip = async (payslipId: number): Promise<Blob> => {
  const response = await axiosClient.get(`/payslips/${payslipId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

// Dashboard
export const getDashboardSummary = async (): Promise<any> => {
  const response = await axiosClient.get('/dashboard/summary');
  return response.data;
};

export const getDashboardAlerts = async (): Promise<any> => {
  const response = await axiosClient.get('/dashboard/alerts');
  return response.data;
};

export const getEmployeeDashboard = async (): Promise<any> => {
  const response = await axiosClient.get('/employees/me/dashboard');
  return response.data;
};

export const getDashboardActivities = async (): Promise<any[]> => {
  try {
    const response = await axiosClient.get('/reports/audit?limit=10');
    return response.data?.auditLogs || response.data || [];
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      return [];
    }
    return [];
  }
};