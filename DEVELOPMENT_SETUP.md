# Development Setup Instructions

## Port Configuration
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Database**: PostgreSQL on localhost:5432

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run prisma:migrate
npm run fresh-setup
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE workzen_hrms;
```

## Environment Variables

### Backend (.env)
- PORT=3000
- DATABASE_URL="postgresql://postgres:admin@localhost:5432/workzen_hrms"
- JWT_SECRET="your-secret-key"
- FRONTEND_URL="http://localhost:3000"

### Frontend (.env.local)
- VITE_API_BASE_URL=http://localhost:3001/api

## API Endpoints
All API endpoints are available at: http://localhost:3001/api

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/invite

### Employees
- GET /api/employees
- GET /api/employees/:id
- POST /api/employees
- PUT /api/employees/:id

### Attendance
- GET /api/attendance
- GET /api/attendance/today
- POST /api/attendance/clock-in
- POST /api/attendance/clock-out

### Time Off
- GET /api/timeoff
- POST /api/timeoff
- PATCH /api/timeoff/:id/approve
- PATCH /api/timeoff/:id/reject

### Payroll
- GET /api/payroll/draft
- POST /api/payroll/compute
- POST /api/payroll/:id/finalize

### Payslips
- GET /api/payslips
- GET /api/payslips/:id/download

## Admin Credentials
- **Email**: admin@gmail.com
- **Password**: 1234567890

## Database Management
- `npm run reset-db` - Clear all data
- `npm run seed` - Add admin user
- `npm run fresh-setup` - Reset and seed in one command

## Notes
- All demo/mock data has been removed
- Only admin user is created during seeding
- Frontend connects directly to live backend API
- CORS is configured to allow frontend origin
- JWT tokens are handled automatically by axios interceptors