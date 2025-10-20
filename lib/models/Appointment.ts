import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };
  diagnosis?: string;
  treatment?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'User',
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine'],
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  reason: {
    type: String,
    required: true,
  },
  notes: String,
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number,
  },
  diagnosis: String,
  treatment: String,
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
}, {
  timestamps: true,
});

AppointmentSchema.index({ appointmentId: 1 });
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ doctorId: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

const getAppointmentModel = () => {
  try {
    return mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
  } catch {
    return mongoose.model<IAppointment>('Appointment', AppointmentSchema);
  }
};

export const Appointment = getAppointmentModel();
