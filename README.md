# LocalPro Time Tracker

A comprehensive employee time tracking and attendance management system built with Next.js and Firebase.

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
- **Firebase Cloud Messaging** - Push notifications for mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore and Authentication enabled
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

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Messaging (optional)
   - Get your Firebase configuration

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key (optional, for notifications)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Employees
1. **Sign In** - Use your company email and password
2. **Clock In** - Click "Clock In" to start your work day
3. **Take Breaks** - Use "Start Break" and "End Break" buttons
4. **Clock Out** - Click "Clock Out" to end your work day
5. **View Summary** - Check your daily time summary at the bottom

### For Administrators
1. **Access Admin Panel** - Navigate to `/admin` (admin role required)
2. **Manage Employees** - Add, edit, or remove employee accounts
3. **View Attendance** - Monitor all employee time entries
4. **Generate Reports** - Create attendance reports for any date range
5. **Export Data** - Download CSV files for payroll integration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication, Cloud Messaging)
- **Icons**: Lucide React
- **Charts**: Recharts (for future analytics)

### Database Schema
- **Employees** - User accounts and role management
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

## 🔒 Security

- **Authentication** - Firebase Authentication with email/password
- **Authorization** - Role-based access control (employee/admin)
- **Data Validation** - Input sanitization and validation
- **Audit Trail** - Complete history of all time entries and changes

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify** - Static site deployment
- **Firebase Hosting** - Direct Firebase integration
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

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
