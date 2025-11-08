# WorkZen HRMS Backend

A comprehensive Human Resource Management System backend built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Invite system with email verification and password reset
- **Employee Management**: Complete employee lifecycle management
- **Attendance Tracking**: Clock in/out functionality with reporting
- **Time-off Management**: Leave request workflow with approval system
- **Payroll Processing**: Automated payroll calculation and payslip generation
- **Email System**: Integrated email notifications using nodemailer
- **Audit Logging**: Complete audit trail for all critical actions
- **Reporting**: Comprehensive reports and analytics

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **PDF Generation**: PDFKit
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- SMTP server (MailHog for development)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/workzen_hrms"
   JWT_SECRET="your-super-secret-jwt-key"
   SMTP_HOST="localhost"
   SMTP_PORT=1025
   EMAIL_FROM="noreply@workzen.com"
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npm run prisma:migrate
   
   # Seed database with demo data
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/accept-invite` - Accept invitation
- `POST /api/auth/set-password` - Set password for invited users

### User Management
- `POST /api/users/invite` - Invite new user (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user

### Employee Management
- `GET /api/employees` - List employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee record
- `PUT /api/employees/:id` - Update employee

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance` - Attendance history

### Time-off Management
- `POST /api/timeoff` - Create leave request
- `GET /api/timeoff` - List time-off requests
- `PUT /api/timeoff/:id/approve` - Approve request
- `PUT /api/timeoff/:id/reject` - Reject request

### Payroll
- `POST /api/payroll/compute` - Compute payroll draft
- `POST /api/payroll/finalize` - Finalize payroll (Admin only)
- `GET /api/payroll` - List payruns
- `GET /api/payroll/:id` - Get payrun details

### Payslips
- `GET /api/payslips` - List payslips
- `GET /api/payslips/:id` - Get payslip details
- `GET /api/payslips/:id/download` - Download payslip PDF

### Reports
- `GET /api/reports/payroll` - Payroll reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/audit` - Audit logs
- `GET /api/reports/dashboard` - Dashboard statistics

## User Roles

- **ADMIN**: Full system access
- **HR**: Employee and time-off management
- **PAYROLL**: Payroll processing and reports
- **EMPLOYEE**: Self-service features

## Demo Credentials

After running the seed script:

```
Admin: admin@workzen.com / admin123
HR: hr@workzen.com / hr123
Payroll: payroll@workzen.com / payroll123
Employee: alice@workzen.com / employee123
Employee: bob@workzen.com / employee123
Employee: charlie@workzen.com / employee123
```

## Payroll Calculation Rules

- **Working Days**: 22 days per month (excluding weekends)
- **Gross Salary**: Base Salary + Allowances
- **PF Deduction**: 12% of base salary (if applicable)
- **Professional Tax**: ₹200 (if applicable)
- **Unpaid Leave**: Pro-rata deduction based on working days
- **Net Salary**: Gross - All Deductions

## Email Configuration

### Development (MailHog)
```bash
# Install MailHog
go install github.com/mailhog/MailHog@latest

# Run MailHog
MailHog

# Access web UI at http://localhost:8025
```

### Production
Use SMTP relay services like:
- AWS SES
- Postmark
- SendGrid

Update `.env`:
```env
SMTP_HOST="smtp.postmarkapp.com"
SMTP_PORT=587
SMTP_USER="your-postmark-token"
SMTP_PASS="your-postmark-token"
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## File Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Seed script
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── bootstrap/       # App initialization
├── data/
│   └── payslips/        # Generated payslip files
├── tests/               # Unit tests
└── server.js           # Entry point
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Email token verification
- Audit logging
- Input validation
- File path protection

## Production Deployment

1. **Environment Variables**
   - Set secure JWT_SECRET
   - Configure production database
   - Set up SMTP relay
   - Enable HTTPS

2. **Database**
   - Use connection pooling
   - Set up backups
   - Monitor performance

3. **Monitoring**
   - Add logging middleware
   - Set up error tracking
   - Monitor API performance

## Background Jobs (Optional)

For production, consider using Redis + Bull for:
- Email sending
- PDF generation
- Report processing

```bash
# Install Redis and Bull
npm install redis bull

# Configure in services
```

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workzen.com","password":"admin123"}'

# Get employees (with token)
curl -X GET http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Compute payroll
curl -X POST http://localhost:3000/api/payroll/compute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"periodStart":"2024-01-01","periodEnd":"2024-01-31"}'
```

### Using Postman

Import the following collection structure:
- Authentication endpoints
- Employee management
- Attendance tracking
- Payroll processing

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Email Not Sending**
   - Check SMTP configuration
   - Verify MailHog is running (development)
   - Check email logs in database

3. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiry
   - Ensure proper Authorization header

4. **Payslip Generation**
   - Check data/payslips directory exists
   - Verify file permissions
   - Check PDF generation logs

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details.