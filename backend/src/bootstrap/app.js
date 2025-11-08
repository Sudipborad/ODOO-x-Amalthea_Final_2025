const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../routes/auth.routes');
const companyRoutes = require('../routes/company.routes');
const dashboardRoutes = require('../routes/dashboard.routes');
const userRoutes = require('../routes/users.routes');
const profileRoutes = require('../routes/profile.routes');
const employeeRoutes = require('../routes/employees.routes');
const employeeProfileRoutes = require('../routes/employeeProfile.routes');
const attendanceRoutes = require('../routes/attendance.routes');
const timeoffRoutes = require('../routes/timeoff.routes');
const payrollRoutes = require('../routes/payroll.routes');
const payslipRoutes = require('../routes/payslip.routes');
const reportRoutes = require('../routes/report.routes');
const settingsRoutes = require('../routes/settings.routes');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3003', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/employee-profile', employeeProfileRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/timeoff', timeoffRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/payslips', payslipRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/settings', settingsRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  });

  return app;
};

module.exports = createApp;