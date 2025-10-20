import mongoose, { Document, Schema } from 'mongoose';

export interface IApplicationSettings extends Document {
  // Clinic Information
  clinicName: string;
  clinicAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite?: string;
  
  // Business Hours
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  
  // Appointment Settings
  appointmentSettings: {
    defaultDuration: number; // in minutes
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowOnlineBooking: boolean;
    requireConfirmation: boolean;
    autoConfirmAppointments: boolean;
    reminderHours: number[];
  };
  
  // Billing Settings
  billingSettings: {
    currency: string;
    taxRate: number;
    defaultPaymentTerms: number; // days
    lateFeeRate: number;
    allowPartialPayments: boolean;
    requireInsuranceVerification: boolean;
  };
  
  // Notification Settings
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
    labResultNotifications: boolean;
    prescriptionReadyNotifications: boolean;
  };
  
  // System Settings
  systemSettings: {
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    language: string;
    maxFileUploadSize: number; // in MB
    sessionTimeout: number; // in minutes
    requireTwoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  
  // Features
  features: {
    patientPortal: boolean;
    onlineAppointments: boolean;
    prescriptionManagement: boolean;
    labResults: boolean;
    billingManagement: boolean;
    inventoryManagement: boolean;
    reporting: boolean;
    auditLogs: boolean;
  };
  
  // Integration Settings
  integrations: {
    emailService: {
      provider: string;
      configured: boolean;
    };
    smsService: {
      provider: string;
      configured: boolean;
    };
    paymentGateway: {
      provider: string;
      configured: boolean;
    };
    labIntegration: {
      provider: string;
      configured: boolean;
    };
  };
  
  // Version and Metadata
  version: string;
  lastUpdated: Date;
  updatedBy: string;
  isInitialized: boolean;
}

const ApplicationSettingsSchema = new Schema<IApplicationSettings>({
  clinicName: {
    type: String,
    required: true,
    default: 'MediNext'
  },
  clinicAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'PH' }
  },
  clinicPhone: {
    type: String,
    required: true
  },
  clinicEmail: {
    type: String,
    required: true
  },
  clinicWebsite: {
    type: String
  },
  businessHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  appointmentSettings: {
    defaultDuration: { type: Number, default: 30 },
    maxAdvanceBookingDays: { type: Number, default: 90 },
    minAdvanceBookingHours: { type: Number, default: 2 },
    allowOnlineBooking: { type: Boolean, default: true },
    requireConfirmation: { type: Boolean, default: true },
    autoConfirmAppointments: { type: Boolean, default: false },
    reminderHours: [{ type: Number }]
  },
  billingSettings: {
    currency: { type: String, default: 'PHP' },
    taxRate: { type: Number, default: 0.08 },
    defaultPaymentTerms: { type: Number, default: 30 },
    lateFeeRate: { type: Number, default: 0.02 },
    allowPartialPayments: { type: Boolean, default: true },
    requireInsuranceVerification: { type: Boolean, default: false }
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true },
    labResultNotifications: { type: Boolean, default: true },
    prescriptionReadyNotifications: { type: Boolean, default: true }
  },
  systemSettings: {
    timezone: { type: String, default: 'Asia/Beijing' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
    language: { type: String, default: 'en' },
    maxFileUploadSize: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 480 },
    requireTwoFactorAuth: { type: Boolean, default: false },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true }
    }
  },
  features: {
    patientPortal: { type: Boolean, default: true },
    onlineAppointments: { type: Boolean, default: true },
    prescriptionManagement: { type: Boolean, default: true },
    labResults: { type: Boolean, default: true },
    billingManagement: { type: Boolean, default: true },
    inventoryManagement: { type: Boolean, default: false },
    reporting: { type: Boolean, default: true },
    auditLogs: { type: Boolean, default: true }
  },
  integrations: {
    emailService: {
      provider: { type: String, default: 'smtp' },
      configured: { type: Boolean, default: false }
    },
    smsService: {
      provider: { type: String, default: 'twilio' },
      configured: { type: Boolean, default: false }
    },
    paymentGateway: {
      provider: { type: String, default: 'stripe' },
      configured: { type: Boolean, default: false }
    },
    labIntegration: {
      provider: { type: String, default: 'manual' },
      configured: { type: Boolean, default: false }
    }
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    required: true
  },
  isInitialized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
ApplicationSettingsSchema.index({}, { unique: true });

const getApplicationSettingsModel = () => {
  try {
    return mongoose.models.ApplicationSettings || mongoose.model<IApplicationSettings>('ApplicationSettings', ApplicationSettingsSchema);
  } catch {
    return mongoose.model<IApplicationSettings>('ApplicationSettings', ApplicationSettingsSchema);
  }
};

export const ApplicationSettings = getApplicationSettingsModel();
