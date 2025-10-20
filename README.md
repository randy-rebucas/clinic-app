# 🏥 MediNext

A comprehensive, production-ready medical management system built with Next.js 15, TypeScript, MongoDB, and Socket.IO. MediNext provides complete patient management, appointment scheduling, prescription management, billing, lab orders, real-time notifications, and more.

## ✨ Features

### 🎯 Core Functionality
- **Patient Management**: Registration, search, medical history tracking
- **Appointment Scheduling**: Calendar integration, time slot management
- **Prescription Management**: Multi-medication prescriptions with delivery tracking
- **Queue Management**: Real-time patient queue with priority handling
- **Billing System**: Invoice generation, payment processing, financial tracking
- **Lab Orders**: Test ordering, result entry, follow-up scheduling
- **Patient Portal**: Secure access to personal medical records
- **Real-time Updates**: Live notifications and status updates via Socket.IO

### 👥 Role-Based Access Control
- **Admin**: Full system access and management
- **Doctor**: Patient care, prescriptions, lab orders, queue management
- **Receptionist**: Patient registration, queue management, billing
- **MedRep**: Patient registration, prescription delivery tracking
- **Patient**: Personal records access via dedicated patient portal

### 🔔 Advanced Features
- **JWT Authentication**: Secure token-based authentication for both staff and patients
- **Real-time Notifications**: Live updates for queue, appointments, and system events
- **Notification System**: Email/SMS notifications for appointments, results, payments
- **PDF Generation**: Automated invoice and prescription PDF creation
- **Reporting Dashboard**: Analytics, statistics, and performance metrics
- **Form Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Protection against brute force attacks
- **Audit Logging**: Comprehensive activity tracking for security
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-app?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   
   # SMS Configuration (Optional)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   
   # Clinic Information
   CLINIC_NAME=HealthCare Clinic
   CLINIC_ADDRESS=123 Medical Center Dr, City, State 12345
   CLINIC_PHONE=(555) 123-4567
   CLINIC_EMAIL=info@clinic.com
   
   # Application Configuration
   NODE_ENV=development
   PORT=3000
   NEXTAUTH_URL=http://localhost:3000
   
   # Socket.IO Configuration
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

4. **Set up the application**
   ```bash
   # Run the setup script to create admin user and initial data
   pnpm setup
   
   # Or use the web interface
   # Navigate to http://localhost:3000/setup after starting the dev server
   ```

5. **Run the application**
   ```bash
   # Development mode with Socket.IO
   pnpm dev:socket
   
   # Standard development mode
   pnpm dev
   
   # Production build
   pnpm build
   pnpm start
   ```

6. **Access the portals**
   - **Staff Portal**: [http://localhost:3000](http://localhost:3000)
   - **Patient Portal**: [http://localhost:3000/patient/login](http://localhost:3000/patient/login)
   - **Setup Page**: [http://localhost:3000/setup](http://localhost:3000/setup)

## 🛠️ Setup Options

### CLI Setup (Recommended)
```bash
# Interactive setup with prompts
pnpm setup

# Check if application is already set up
pnpm setup:check

# Reset application (delete all data)
pnpm setup:reset

# Setup with custom credentials
node scripts/setup.js --admin-email admin@yourclinic.com --admin-password YourSecurePassword123!
```

### Web Interface Setup
1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/setup`
3. Fill in the setup form with your admin credentials
4. Click "Setup Application"

### API Setup
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

### Default Admin Credentials
- **Email**: `admin@clinic.com`
- **Password**: `Admin123!@#`

⚠️ **Important**: Change these credentials after first login!

## 📁 Project Structure

```
clinic-app/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── login/     # Staff login
│   │   │   ├── patient/   # Patient authentication
│   │   │   └── employee/  # Employee management
│   │   ├── patients/      # Patient management
│   │   ├── appointments/  # Appointment scheduling
│   │   ├── prescriptions/ # Prescription management
│   │   ├── billing/       # Billing and payments
│   │   ├── lab-orders/    # Lab test management
│   │   ├── queue/         # Queue management
│   │   ├── notifications/ # Notification system
│   │   └── socketio/      # Socket.IO endpoint
│   ├── patient/           # Patient portal pages
│   │   ├── login/         # Patient login
│   │   ├── register/      # Patient registration
│   │   └── dashboard/     # Patient dashboard
│   ├── admin/             # Admin pages
│   ├── appointments/      # Appointment pages
│   ├── prescriptions/     # Prescription pages
│   ├── billing/           # Billing pages
│   ├── lab-orders/        # Lab order pages
│   ├── queue/             # Queue management pages
│   ├── medrep/            # MedRep dashboard
│   └── reports/           # Reports and analytics
├── components/            # React components
│   └── Auth/             # Authentication components
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Staff authentication
│   └── PatientAuthContext.tsx # Patient authentication
├── lib/                  # Utility libraries
│   ├── models/           # Database models (8 models)
│   ├── hooks/            # Custom hooks
│   │   └── useSocket.ts  # Socket.IO hook
│   ├── database.ts       # Database functions
│   ├── auth.ts           # JWT authentication utilities
│   ├── notifications.ts  # Email/SMS notifications
│   ├── validation.ts     # Zod validation schemas
│   ├── pdf-generator.ts  # PDF generation utilities
│   ├── socket.ts         # Socket.IO management
│   ├── rateLimiter.ts    # Rate limiting
│   ├── audit.ts          # Audit logging
│   ├── backup.ts         # Backup utilities
│   └── config.ts         # Application configuration
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── server.ts             # Socket.IO server
```

## 🗄️ Database Schema

### Core Models (8 Models)
- **User**: Staff authentication with role-based access (Admin, Doctor, Receptionist, MedRep)
- **Patient**: Complete patient information, medical history, and demographics
- **Appointment**: Scheduling, visit records, vitals, diagnosis, and treatment notes
- **Prescription**: Multi-medication prescriptions with delivery tracking
- **Queue**: Real-time patient queue with priority and status management
- **Invoice**: Comprehensive billing with itemized charges and tax calculations
- **Payment**: Payment processing with multiple payment methods
- **LabOrder**: Laboratory test orders with results and follow-up scheduling
- **AuditLog**: Security and activity tracking for compliance

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login with JWT token
- `POST /api/auth/patient/login` - Patient login with JWT token
- `POST /api/auth/patient/register` - Patient registration
- `GET /api/auth/employee` - Get employee information
- `POST /api/auth/employee` - Create new employee

### Patient Management
- `GET /api/patients?q=search` - Search patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details

### Appointments
- `GET /api/appointments?doctorId=id&date=date` - Get appointments
- `POST /api/appointments` - Create appointment

### Prescriptions
- `GET /api/prescriptions?id=id` - Get prescription
- `POST /api/prescriptions` - Create prescription

### Billing
- `GET /api/billing/invoices?patientId=id` - Get invoices
- `POST /api/billing/invoices` - Create invoice
- `GET /api/billing/payments?patientId=id` - Get payments
- `POST /api/billing/payments` - Process payment
- `GET /api/billing/summary?patientId=id` - Get billing summary

### Lab Orders
- `GET /api/lab-orders?id=id&patientId=id` - Get lab orders
- `POST /api/lab-orders` - Create lab order
- `PUT /api/lab-orders/[id]/results` - Update lab results

### Queue Management
- `GET /api/queue?status=status` - Get queue
- `POST /api/queue` - Add to queue
- `PUT /api/queue/[id]` - Update queue status

### Notifications
- `POST /api/notifications/send` - Send notification

### Socket.IO
- `GET /api/socketio` - Socket.IO endpoint for real-time communication

## 🎨 UI Components

The system uses a modern, responsive design with:
- **Tailwind CSS** for styling with custom design system
- **Lucide React** for icons
- **React Hook Form** for form management
- **Zod** for comprehensive validation
- **Custom components** for clinic-specific functionality
- **Real-time updates** with Socket.IO integration
- **JWT authentication** with secure token management
- **Role-based UI** that adapts to user permissions

## 📧 Notification System

### Real-time Notifications (Socket.IO)
- Live queue updates
- Appointment status changes
- Prescription status updates
- Lab result notifications
- System alerts and maintenance

### Email Notifications
- Appointment scheduled/reminders
- Prescription ready for pickup
- Lab results available
- Payment reminders
- Critical lab results

### SMS Notifications (Optional)
- Appointment reminders
- Critical lab results
- Payment due notifications
- Emergency notifications

## 📊 Reporting & Analytics

The reports dashboard provides:
- Patient statistics
- Appointment analytics
- Revenue tracking
- Doctor performance metrics
- Lab test statistics
- Export capabilities (PDF, CSV)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication for both staff and patients
- **Role-Based Access Control**: Granular permissions by user role (Admin, Doctor, Receptionist, MedRep, Patient)
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Protection against brute force attacks and abuse
- **Password Hashing**: bcrypt for secure password storage
- **Audit Logging**: Comprehensive activity tracking for security and compliance
- **Secure File Uploads**: Validated file uploads with size limits
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas or a production MongoDB instance
3. **Security**: Change default JWT secret and use strong passwords
4. **SSL**: Enable HTTPS in production
5. **Monitoring**: Set up application monitoring and logging
6. **Backup**: Implement regular database backups

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push
4. Configure custom domain and SSL

### Docker
```bash
# Build the image
docker build -t clinic-app .

# Run the container
docker run -p 3000:3000 clinic-app
```

### Manual Deployment
1. Build the application: `pnpm build`
2. Start the production server: `pnpm start`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificate
5. Configure Socket.IO for production

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [your-email@domain.com]
- Documentation: [link-to-docs]

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added patient portal and notifications
- **v1.2.0** - Enhanced reporting and PDF generation
- **v1.3.0** - Improved UI/UX and performance optimizations
- **v2.0.0** - **MAJOR UPDATE**: Complete system overhaul
  - ✅ JWT authentication for both staff and patients
  - ✅ Real-time updates with Socket.IO
  - ✅ Comprehensive patient portal
  - ✅ Enhanced security with rate limiting and audit logging
  - ✅ Complete API coverage with 20+ endpoints
  - ✅ Production-ready with full error handling
  - ✅ 8 database models with full relationships
  - ✅ Role-based access control (5 user types)

## 🎯 Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **JWT** - Secure authentication tokens
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Schema validation
- **bcrypt** - Password hashing
- **Lucide React** - Modern icon library

---

Built with ❤️ for healthcare professionals

**Status**: ✅ Production Ready | **Last Updated**: December 2024