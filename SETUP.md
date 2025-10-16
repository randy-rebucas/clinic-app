# 🚀 Quick Setup Guide

## Demo Mode (Current Setup)

The application is currently running in **Demo Mode** with the following credentials:

### Login Credentials
- **Employee Account**: `demo@localpro.com` / `demo123`
- **Admin Account**: `admin@localpro.com` / `admin123`

### What Works in Demo Mode
✅ **Time Tracking**: Clock in/out, break tracking  
✅ **Real-time Status**: Working/break/offline status  
✅ **Daily Summary**: Time calculations and summaries  
✅ **Admin Panel**: Employee management and reports  
✅ **Notifications**: Browser notifications  
✅ **UI/UX**: Full interface and navigation  

### What's Simulated
🔄 **Database**: All data is simulated (not persisted)  
🔄 **Authentication**: Local demo authentication  
🔄 **Firebase**: Using demo configuration  

---

## 🔥 Production Setup (Firebase)

To use with real Firebase backend:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Cloud Messaging (optional)

### 2. Get Firebase Config
1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Add a web app and copy the config

### 3. Update Environment Variables
Replace `.env.local` with your real Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_real_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 4. Restart Application
```bash
npm run dev
```

---

## 🎯 Features Overview

### For Employees
- **Clock In/Out**: Simple button interface
- **Break Tracking**: Start/end breaks with duration
- **Real-time Status**: Live working status display
- **Daily Summary**: View your daily time summary
- **Notifications**: Browser notifications for reminders

### For Administrators
- **Employee Management**: Add, edit, remove employees
- **Attendance Monitoring**: View all time entries
- **Report Generation**: Create custom reports
- **CSV Export**: Download data for payroll
- **System Settings**: Configure work parameters

---

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── Admin/          # Admin panel components
│   ├── Auth/           # Authentication components
│   ├── Navigation/     # Navigation components
│   └── TimeTracker/    # Time tracking components
├── contexts/           # React contexts
├── lib/               # Utility libraries
└── types/             # TypeScript definitions
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Options
- **Netlify**: Static site deployment
- **Firebase Hosting**: Direct Firebase integration
- **Docker**: Containerized deployment

---

## 📞 Support

- **Demo Issues**: Check browser console for errors
- **Firebase Setup**: Follow Firebase documentation
- **Feature Requests**: Create GitHub issue
- **Bug Reports**: Include console logs and steps to reproduce

---

## 🎉 Ready to Use!

The application is now running at `http://localhost:3000`

**Next Steps:**
1. Try the demo login credentials
2. Test the time tracking features
3. Explore the admin panel
4. Set up Firebase for production use
