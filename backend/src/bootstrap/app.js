const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/users.routes');
const employeeRoutes = require('../routes/employees.routes');
const attendanceRoutes = require('../routes/attendance.routes');
const timeoffRoutes = require('../routes/timeoff.routes');
const payrollRoutes = require('../routes/payroll.routes');
const payslipRoutes = require('../routes/payslip.routes');
const reportRoutes = require('../routes/report.routes');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/timeoff', timeoffRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/payslips', payslipRoutes);
  app.use('/api/reports', reportRoutes);

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