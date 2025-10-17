# LocalPro Time Tracker

A comprehensive employee time tracking and attendance management system built with Next.js and MongoDB.

## 🎯 Features

### Core Time Tracking
- **Clock In/Out System** - Simple button-based interface with timestamps and notes
- **Break Tracking** - Start/end break functionality with automatic duration calculation
- **Real-Time Status** - Live display of working, break, or offline status
- **Activity Logs** - Complete history of all time entries with timestamps

### Reporting & Analytics
- **Daily Summaries** - Total work time, break time, and overtime calculations
- **Weekly Reports** - Comprehensive weekly attendance summaries
- **CSV Export** - Export attendance data for payroll integration
- **Overtime Tracking** - Automatic overtime detection and alerts

### Admin Panel
- **Employee Management** - Add, edit, and manage employee accounts
- **Attendance Monitoring** - View and manage all employee time entries
- **Report Generation** - Create custom attendance reports by date range
- **Manual Adjustments** - Edit incorrect time entries with audit trail

### Notifications
- **Browser Notifications** - Real-time alerts for clock in/out reminders
- **Break Reminders** - Configurable break interval notifications
- **Overtime Alerts** - Notifications when approaching overtime thresholds
- **Browser Notifications** - Real-time notifications for time tracking events

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- Modern web browser with notification support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd localpro-time-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Create a MongoDB database (local or cloud)
   - For cloud: Use MongoDB Atlas or any MongoDB cloud provider
   - For local: Install MongoDB locally
   - Get your MongoDB connection string

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localpro-time-tracker?retryWrites=true&w=majority
   ```
   
   **Examples:**
   ```env
   # For local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/localpro-time-tracker
   
   # For MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localpro-time-tracker?retryWrites=true&w=majority
   ```
   
   **Important**: 
   - Replace the MongoDB URI with your actual database connection string
   - Never commit the `.env.local` file to version control
   - For production, set the environment variable in your deployment platform
   - If no `.env.local` file is found, the app will use a default connection string for demo purposes

5. **Set up demo accounts (optional)**
   ```bash
   # Create demo employee and admin accounts for testing
   npx tsx scripts/recreate-demo-accounts.ts
   ```
   
   This will create demo accounts with secure passwords:
   - **Employee**: `john.doe@demo.com` / `john123` (Software Developer)
   - **Employee**: `jane.smith@demo.com` / `jane123` (Marketing Manager)  
   - **Admin**: `admin@demo.com` / `admin123` (System Administrator)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚡ Quick Start with Demo Accounts

To quickly test the application with pre-configured accounts:

1. **Create demo accounts with passwords**:
   ```bash
   npx tsx scripts/recreate-demo-accounts.ts
   ```

2. **Use demo credentials**:
   - **Employee**: `john.doe@demo.com` / `john123`
   - **Employee**: `jane.smith@demo.com` / `jane123`
   - **Admin**: `admin@demo.com` / `admin123`

3. **Start testing**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Use demo email addresses and passwords to sign in
   - Test time tracking, breaks, and admin features

## 📱 Usage

### For Employees
1. **Sign In** - Use your company email and password (or demo account: `john.doe@demo.com` / `john123`)
2. **Clock In** - Click "Clock In" to start your work day
3. **Take Breaks** - Use "Start Break" and "End Break" buttons
4. **Clock Out** - Click "Clock Out" to end your work day
5. **View Summary** - Check your daily time summary at the bottom

### For Administrators
1. **Access Admin Panel** - Navigate to `/admin` (use demo admin: `admin@demo.com` / `admin123`)
2. **Manage Employees** - Add, edit, or remove employee accounts
3. **View Attendance** - Monitor all employee time entries
4. **Generate Reports** - Create attendance reports for any date range
5. **Export Data** - Download CSV files for payroll integration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: MongoDB with Mongoose ODM
- **Authentication**: Secure password-based authentication with bcrypt hashing
- **Icons**: Lucide React
- **Charts**: Recharts (for future analytics)

### Database Schema
- **Employees** - User accounts with secure password authentication and role management
- **Time Entries** - Individual clock in/out and break records
- **Work Sessions** - Complete work periods with break tracking
- **Daily Summaries** - Aggregated daily attendance data
- **Weekly Summaries** - Weekly attendance analytics
- **Attendance Reports** - Generated reports for payroll

### Key Components
- `AuthContext` - Authentication state management
- `TimeTrackingService` - Core time tracking logic
- `NotificationService` - Browser and push notifications
- `AdminDashboard` - Administrative interface
- `TimeTrackerDashboard` - Employee interface

### Scripts Directory
The `scripts/` directory contains utility scripts for database management and demo setup:
- `recreate-demo-accounts.ts` - Create demo accounts with secure passwords
- `add-passwords-to-demo-accounts.ts` - Add passwords to existing demo accounts
- `demo-accounts-summary.ts` - Display all demo accounts with details
- `check-demo-accounts.ts` - Check existing demo accounts
- `create-admin-account.ts` - Create admin demo accounts
- `setup-demo-accounts.ts` - Full demo account setup
- `migrate-data.js` - Database migration utilities
- `test-mongodb.js` - Database connection testing

## 🎭 Demo Accounts

The application comes with pre-configured demo accounts with secure passwords for testing and development:

### Available Demo Accounts
- **John Doe** (`john.doe@demo.com` / `john123`) - Software Developer (Engineering)
- **Jane Smith** (`jane.smith@demo.com` / `jane123`) - Marketing Manager (Marketing)
- **Admin User** (`admin@demo.com` / `admin123`) - System Administrator (Administration)

### Demo Account Features
- ✅ Secure password authentication with bcrypt hashing
- ✅ Pre-configured work schedules
- ✅ Idle detection settings
- ✅ Attendance tracking setup
- ✅ Admin panel access (for admin account)

### Demo Account Scripts
```bash
# Create demo accounts with secure passwords
npx tsx scripts/recreate-demo-accounts.ts

# Add passwords to existing demo accounts
npx tsx scripts/add-passwords-to-demo-accounts.ts

# View all demo accounts and their details
npx tsx scripts/demo-accounts-summary.ts

# Check existing demo accounts
npx tsx scripts/check-demo-accounts.ts

# Create additional demo accounts (if needed)
npx tsx scripts/create-admin-account.ts
```

**Note**: These are demo accounts for testing purposes. All passwords are securely hashed using bcrypt. In a production environment, implement additional security measures and proper password policies.

## 🔧 Configuration

### Notification Settings
Configure notification preferences in the admin panel:
- Clock in/out reminders
- Break interval notifications
- Overtime threshold alerts
- Custom reminder times

### Work Schedule
Set default work parameters:
- Standard work hours per day
- Break reminder intervals
- Overtime calculation thresholds

## 📊 Data Export

### CSV Format
Exported reports include:
- Employee information
- Date ranges
- Total work time
- Break time
- Overtime hours
- Individual time entries

### Integration
CSV files are compatible with:
- Payroll systems
- HR management software
- Accounting platforms
- Custom reporting tools

## 🔐 Authentication System

### Password Security
- **Bcrypt Hashing** - All passwords are hashed using bcrypt with cost factor 12
- **Secure Comparison** - Password verification uses bcrypt's secure comparison method
- **Minimum Requirements** - Passwords must be at least 6 characters long
- **No Plain Text Storage** - Passwords are never stored in plain text

### Authentication Flow
1. **Login** - Users provide email and password
2. **Verification** - Server verifies credentials against hashed passwords
3. **Session Creation** - Valid users receive authentication tokens
4. **Role Assignment** - Users are assigned appropriate roles (employee/admin)
5. **Access Control** - Role-based permissions control feature access

### API Endpoints
- `POST /api/auth/login` - User authentication with password verification
- `GET /api/auth/employee` - Fetch employee data by ID or email
- `POST /api/auth/employee` - Create new employee accounts with passwords

## 🔒 Security

- **Authentication** - Secure password-based authentication with bcrypt hashing
- **Password Security** - Passwords are hashed with bcrypt (cost factor 12)
- **Authorization** - Role-based access control (employee/admin)
- **Data Validation** - Input sanitization and validation
- **Session Management** - Secure session handling with localStorage persistence
- **Audit Trail** - Complete history of all time entries and changes
- **API Security** - Passwords are never returned in API responses

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify** - Static site deployment
- **MongoDB Atlas** - Cloud database hosting
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues

#### Environment Variable Errors
If you see "MONGODB_URI environment variable is required":
1. Create a `.env.local` file in the root directory
2. Add your MongoDB connection string:
   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   ```
3. Restart the development server

#### Database Connection Issues
- Ensure your MongoDB server is running
- Verify your connection string is correct
- Check if your IP is whitelisted (for MongoDB Atlas)
- Ensure your database user has proper permissions

#### Demo Account Issues
If demo accounts don't work:
1. Run the demo account setup script:
   ```bash
   npx tsx scripts/recreate-demo-accounts.ts
   ```
2. Verify the accounts were created successfully
3. Check the console for any error messages

### Getting Help
For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🔮 Future Enhancements

- **Mobile App** - React Native mobile application
- **GPS Tracking** - Location-based clock in/out
- **Biometric Integration** - Fingerprint/face recognition
- **Advanced Analytics** - Charts and productivity insights
- **Team Management** - Department and team organization
- **Shift Scheduling** - Automated shift management
- **API Integration** - RESTful API for third-party integrations
