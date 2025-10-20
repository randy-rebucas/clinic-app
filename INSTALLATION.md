# Installation Guide

MediNext includes an automatic installation flow that detects when no users exist and guides you through the initial setup process.

## How It Works

1. **Automatic Detection**: When you first access the application, it checks if any users exist in the database
2. **Installation Redirect**: If no users are found, you're automatically redirected to `/install`
3. **Guided Setup**: A multi-step installation form guides you through:
   - Creating an administrator account
   - Setting up clinic information
   - Configuring business hours
   - Setting system preferences

## Installation Steps

### Step 1: Administrator Account
- Set up the main administrator account
- Choose email and password for the admin user
- This account will have full system access

### Step 2: Clinic Information
- Enter your clinic's name and address
- Set contact information (phone, email, website)
- Configure location details

### Step 3: Business Hours
- Set operating hours for each day of the week
- Choose which days your clinic is open
- Set opening and closing times

### Step 4: System Settings
- Select your timezone
- Choose your preferred currency
- Option to include sample data for testing

## Features

- **Multi-step Form**: User-friendly interface with progress indicators
- **Validation**: Real-time form validation with helpful error messages
- **Custom Settings**: Clinic-specific configuration during setup
- **Sample Data**: Optional inclusion of test data to help you get started
- **Automatic Redirect**: Seamless transition to the main application after setup

## Manual Installation

If you prefer to set up the system manually, you can:

1. Use the existing `/setup` page for basic setup
2. Use the API endpoints directly:
   - `GET /api/setup` - Check installation status
   - `POST /api/setup` - Run installation with custom settings

## API Usage

### Check Installation Status
```bash
curl -X GET http://localhost:3000/api/setup
```

### Run Installation
```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setup",
    "adminName": "System Administrator",
    "adminEmail": "admin@clinic.com",
    "adminPassword": "Admin123!@#",
    "includeSeedData": true,
    "clinicSettings": {
      "clinicName": "My Clinic",
      "clinicAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "PH"
      },
      "clinicPhone": "+1 (555) 123-4567",
      "clinicEmail": "info@clinic.com",
      "businessHours": {
        "monday": {"open": "09:00", "close": "17:00", "isOpen": true},
        "tuesday": {"open": "09:00", "close": "17:00", "isOpen": true},
        "wednesday": {"open": "09:00", "close": "17:00", "isOpen": true},
        "thursday": {"open": "09:00", "close": "17:00", "isOpen": true},
        "friday": {"open": "09:00", "close": "17:00", "isOpen": true},
        "saturday": {"open": "10:00", "close": "14:00", "isOpen": false},
        "sunday": {"open": "10:00", "close": "14:00", "isOpen": false}
      },
      "timezone": "Asia/Beijing",
      "currency": "PHP"
    }
  }'
```

## Security Notes

- The installation process only runs when no users exist in the system
- After installation, the `/install` route should be protected or removed in production
- Admin credentials are displayed after successful installation - change them immediately
- The system includes password policy enforcement

## Troubleshooting

### Installation Fails
- Check database connection
- Ensure all required environment variables are set
- Verify MongoDB is running and accessible

### Can't Access Installation
- Clear browser cache and cookies
- Check if users already exist in the database
- Try accessing `/install` directly

### Reset Installation
- Use the reset functionality in the setup page
- Or manually delete all users from the database
- Then restart the application

## Production Deployment

For production deployment:

1. **Remove Installation Route**: Consider removing or protecting the `/install` route
2. **Environment Variables**: Ensure all required environment variables are properly set
3. **Database Security**: Use proper database authentication and network security
4. **Admin Credentials**: Change default admin credentials immediately after installation
5. **Backup**: Create a backup of your database after successful installation
