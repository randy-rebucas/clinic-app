// Application configuration
export const config = {
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://admin_db_user:RSOrq2XA4yYzJSCY@main.3sjcnia.mongodb.net/clinic-app?retryWrites=true&w=majority',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },

  // Clinic Information
  clinic: {
    name: process.env.CLINIC_NAME || 'MediNext',
    address: process.env.CLINIC_ADDRESS || '123 Medical Center Dr, City, State 12345',
    phone: process.env.CLINIC_PHONE || '(555) 123-4567',
    email: process.env.CLINIC_EMAIL || 'info@clinic.com',
  },

  // SMS Configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Application Configuration
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // PDF Generation
  pdf: {
    serviceApiKey: process.env.PDF_SERVICE_API_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    authMax: 5, // limit auth endpoints to 5 requests per windowMs
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Notification Settings
  notifications: {
    emailEnabled: !!process.env.SMTP_USER,
    smsEnabled: !!process.env.TWILIO_ACCOUNT_SID,
    appointmentReminderHours: 24,
    paymentReminderDays: 7,
  },
};

// Validation function to check required environment variables
export function validateConfig() {
  const required = [
    'MONGODB_URI',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return missing.length === 0;
}

// Export individual config sections for easier imports
export const { mongodb, email, clinic, sms, jwt, app, upload, pdf, rateLimit, pagination, notifications } = config;

// Export MONGODB_URI for backward compatibility
export const MONGODB_URI = config.mongodb.uri;