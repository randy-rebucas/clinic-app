# MediNext - Setup Guide

This guide will help you set up the MediNext with an admin user, initial application settings, and sample data.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- Environment variables configured

## Quick Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/clinic-app
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-app

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Optional: Clinic Information
CLINIC_NAME=Your Clinic Name
CLINIC_ADDRESS=123 Medical Center Dr, City, State 12345
CLINIC_PHONE=(555) 123-4567
CLINIC_EMAIL=info@yourclinic.com
```

### 3. Run Setup

You have several options for setting up the application:

#### Option A: CLI Setup Script (Recommended)

```bash
# Interactive setup
npm run setup

# Check if already set up
npm run setup:check

# Reset application (delete all data)
npm run setup:reset

# Setup with custom admin credentials
node scripts/setup.js --admin-email admin@yourclinic.com --admin-password YourSecurePassword123!
```

#### Option B: Web Interface Setup

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/setup`

3. Fill in the setup form with your admin credentials

4. Click "Setup Application"

#### Option C: API Setup

```bash
# Check setup status
curl -X GET http://localhost:3000/api/setup

# Run setup
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@yourclinic.com",
    "adminPassword": "YourSecurePassword123!",
    "adminName": "System Administrator",
    "includeSeedData": true
  }'
```

## What Gets Created

### Admin User
- **Email**: `admin@clinic.com` (or your custom email)
- **Password**: `Admin123!@#` (or your custom password)
- **Role**: `admin`
- **Permissions**: Full system access

### Application Settings
- Clinic information and business hours
- Appointment settings and policies
- Billing and payment configurations
- Notification preferences
- System security settings
- Feature toggles

### Sample Data (if enabled)
- **3 Doctors** with different specializations
- **2 Receptionists** for front office operations
- **1 Medical Representative** for pharmacy
- **3 Sample Patients** with medical history
- **3 Appointments** scheduled for different doctors
- **2 Prescriptions** with medications
- **2 Lab Orders** with various tests
- **2 Invoices** with billing items
- **1 Payment** record
- **2 Queue Entries** for patient flow

## Default Admin Credentials

If you use the default setup:
- **Email**: `admin@clinic.com`
- **Password**: `Admin123!@#`

**⚠️ Important**: Change these credentials after first login!

## Post-Setup Steps

### 1. Login and Change Admin Password

1. Go to `http://localhost:3000`
2. Login with admin credentials
3. Navigate to user settings
4. Change the default password

### 2. Configure Clinic Information

1. Go to Admin Settings
2. Update clinic name, address, and contact information
3. Set business hours
4. Configure appointment policies

### 3. Set Up Email/SMS Notifications (Optional)

1. Configure SMTP settings for email notifications
2. Set up Twilio for SMS notifications
3. Test notification delivery

### 4. Add Real Users

1. Create doctor accounts
2. Create receptionist accounts
3. Set up user roles and permissions

## Troubleshooting

### Common Issues

#### "Admin user already exists"
- The application is already set up
- Use `npm run setup:check` to verify
- Use `npm run setup:reset` to reset and start over

#### "MongoDB connection failed"
- Check your `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running
- Verify network connectivity for cloud databases

#### "Setup failed with validation errors"
- Check that all required fields are provided
- Ensure email format is valid
- Verify password meets requirements (min 6 characters)

### Reset Application

If you need to start over:

```bash
# Reset everything
npm run setup:reset

# Or via API
curl -X DELETE http://localhost:3000/api/setup
```

### Check Setup Status

```bash
# CLI
npm run setup:check

# API
curl -X GET http://localhost:3000/api/setup
```

## Security Considerations

1. **Change Default Passwords**: Always change default admin credentials
2. **Secure JWT Secret**: Use a strong, random JWT secret
3. **Environment Variables**: Never commit `.env.local` to version control
4. **Database Access**: Restrict database access to application servers only
5. **HTTPS**: Use HTTPS in production
6. **Regular Backups**: Set up automated database backups

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper email/SMS services
4. Set up SSL certificates
5. Configure reverse proxy (nginx/Apache)
6. Set up monitoring and logging
7. Create regular database backups

## Support

If you encounter issues during setup:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check network connectivity
5. Review the troubleshooting section above

For additional help, please refer to the main documentation or contact support.