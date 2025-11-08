require('dotenv').config();
const createApp = require('./src/bootstrap/app');

const app = createApp();
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 WorkZen HRMS Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Try a different port or stop the other service.`);
    process.exit(1);
  } else {
    throw err;
  }
});