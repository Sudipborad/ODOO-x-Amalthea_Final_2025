# WorkZen HRMS

A comprehensive Human Resources Management System built with Node.js, Express, React, and PostgreSQL.

## Features

- **Employee Management** - Complete employee profiles, verification workflow
- **Attendance Tracking** - Clock-in/out, real-time status indicators
- **Time-off Management** - Leave requests and approvals
- **Payroll Processing** - Automated salary calculations with PF and tax deductions
- **Role-based Access Control** - ADMIN, HR, PAYROLL, EMPLOYEE roles
- **Company Registration** - Multi-tenant support
- **Dashboard Analytics** - Role-specific dashboards

## Tech Stack

**Backend:**
- Node.js & Express
- PostgreSQL with Prisma ORM
- JWT Authentication
- Nodemailer for emails
- PDFKit for payslips

**Frontend:**
- React with TypeScript
- Tailwind CSS
- Axios for API calls
- React Router

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sudipborad/ODOO-x-Amalthea_Final_2025.git
cd ODOO-x-Amalthea_Final_2025
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma migrate dev
npm run seed-fake-data
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | john@techcorp.com | password123 |
| HR | sarah@techcorp.com | password123 |
| Payroll | david@techcorp.com | password123 |
| Employee | mike@techcorp.com | password123 |

## API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/users` - Get all users (Admin/HR)
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/payroll` - Get payroll data
- `POST /api/timeoff` - Submit time-off request

## Database Schema

The system uses PostgreSQL with the following main entities:
- Users & Employees
- Attendance records
- Time-off requests
- Payroll & Payslips
- Companies & Departments

## Development

### Running with fake data
```bash
cd backend
node seed-fake-data.js
```

### Database reset
```bash
npx prisma migrate reset
npm run seed-fake-data
```

## License

MIT License - see LICENSE file for details.

## Contributors

Built for Amalthea 2025 - IIT Gandhinagar