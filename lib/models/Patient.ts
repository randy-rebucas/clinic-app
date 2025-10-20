import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  medicalHistory: [String],
  allergies: [String],
  medications: [String],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
  },
}, {
  timestamps: true,
});

PatientSchema.index({ patientId: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ firstName: 1, lastName: 1 });

const getPatientModel = () => {
  try {
    return mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
  } catch {
    return mongoose.model<IPatient>('Patient', PatientSchema);
  }
};

export const Patient = getPatientModel();
