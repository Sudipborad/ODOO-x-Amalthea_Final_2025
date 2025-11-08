# WorkZen HRMS - Frontend Application

A modern, beginner-friendly Human Resources Management System built with React, TypeScript, and Tailwind CSS. This application features a complete mock mode for development and demonstration purposes.

## 🚀 Features

- **Role-Based Access Control**: Support for Admin, HR Officer, Payroll Officer, and Employee roles
- **Mock Mode**: Fully functional UI without requiring a backend API
- **Employee Management**: View and manage employee profiles and information
- **Attendance Tracking**: Clock in/out functionality and attendance records
- **Time Off Management**: Submit, approve, and reject leave requests
- **Payroll Processing**: Compute payroll drafts and manage employee compensation
- **Payslips**: View and download employee payslips
- **Reports**: Generate various organizational reports
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## 🛠 Tech Stack

- **React 18+** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## 🚀 Getting Started

### 1. Clone or Download the Project

If you received this as a zip file, extract it to your desired location.

### 2. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
copy .env.local.example .env.local
```

Edit the `.env.local` file:

```env
# For mock mode (recommended for development)
VITE_API_BASE_URL=MOCK

# For real API mode (when you have a backend)
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Demo Accounts

The application includes several demo accounts for testing different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workzen.com | password |
| HR Officer | john.doe@workzen.com | password |
| Payroll Officer | jane.smith@workzen.com | password |
| Employee | mike.johnson@workzen.com | password |

## 🎭 Mock Mode vs Real API Mode

### Mock Mode (Default)
- Set `VITE_API_BASE_URL=MOCK` in your `.env.local` file
- Uses local JSON data from the `src/mocks/` directory
- Simulates network delays (300ms) for realistic experience
- Perfect for development and demonstration
- Includes a role switcher in the header for easy testing

### Real API Mode
- Set `VITE_API_BASE_URL=http://your-api-url` in your `.env.local` file
- Makes actual HTTP requests to your backend API
- Requires a compatible backend server
- JWT tokens are automatically included in requests

## 🏗 Project Structure

```
src/
├── api/                    # API layer
│   ├── axiosClient.ts     # Configured Axios instance
│   └── apiAdapter.ts      # API functions with mock/real switching
├── components/            # Reusable components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── ui/               # UI components (Table, Modal, etc.)
│   └── ProtectedRoute.tsx # Route protection
├── context/              # React Context providers
│   └── AuthContext.tsx   # Authentication state management
├── hooks/                # Custom React hooks
│   └── useFetch.ts       # Data fetching hook
├── mocks/                # Mock data files
├── pages/                # Page components
├── styles/               # CSS files
├── utils/                # Utility functions
└── config/               # Configuration files
```

## 🎯 Key Demo Flows

### HR Officer Flow
1. Login as HR Officer (john.doe@workzen.com / password)
2. Navigate to "Employees" to view all employees
3. Click on an employee to view their detailed profile
4. Go to "Time Off" to approve/reject leave requests

### Payroll Officer Flow
1. Login as Payroll Officer (jane.smith@workzen.com / password)
2. Navigate to "Payroll"
3. Select a pay period and click "Compute Draft"
4. Review the generated payroll data

### Employee Flow
1. Login as Employee (mike.johnson@workzen.com / password)
2. Use "Attendance" page to clock in/out
3. Submit time off requests in "Time Off"
4. View payslips in "Payslips"

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Adding New Mock Data
1. Create or edit JSON files in `src/mocks/`
2. Update the corresponding API functions in `src/api/apiAdapter.ts`

### Modifying User Roles
1. Update the `UserRole` type in `src/utils/roleUtils.ts`
2. Modify role-checking functions as needed
3. Update the sidebar navigation logic

### Styling Changes
- All styles use Tailwind CSS utility classes
- Custom styles are defined in `src/styles/index.css`
- Component-specific styles are inline with Tailwind classes

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `vite.config.ts` or kill the process using port 3000

2. **Dependencies not installing**
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

3. **Environment variables not working**
   - Make sure your `.env.local` file is in the root directory
   - Restart the development server after changing environment variables

4. **Mock data not loading**
   - Ensure `VITE_API_BASE_URL=MOCK` in your `.env.local` file
   - Check browser console for any JavaScript errors

## 📝 Notes for Developers

- The application uses functional components with React hooks
- State management is handled through React Context API
- All API calls go through the `apiAdapter.ts` which handles mock/real API switching
- The codebase is well-commented and beginner-friendly
- TypeScript is used throughout for better development experience

## 🤝 Contributing

This is a demo application designed for learning and demonstration purposes. Feel free to modify and extend it according to your needs.

## 📄 License

This project is for educational and demonstration purposes.