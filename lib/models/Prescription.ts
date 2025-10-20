import mongoose, { Document, Schema } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface IPrescription extends Document {
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medications: IMedication[];
  diagnosis: string;
  notes?: string;
  status: 'pending' | 'approved' | 'dispensed' | 'delivered' | 'cancelled';
  prescribedDate: Date;
  validUntil: Date;
  deliveredBy?: string; // MedRep ID or clinic staff
  deliveredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  instructions: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const PrescriptionSchema = new Schema<IPrescription>({
  prescriptionId: {
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
  appointmentId: {
    type: String,
    ref: 'Appointment',
  },
  medications: [MedicationSchema],
  diagnosis: {
    type: String,
    required: true,
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'dispensed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  prescribedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  deliveredBy: {
    type: String,
    ref: 'User',
  },
  deliveredDate: Date,
}, {
  timestamps: true,
});

PrescriptionSchema.index({ prescriptionId: 1 });
PrescriptionSchema.index({ patientId: 1 });
PrescriptionSchema.index({ doctorId: 1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ prescribedDate: 1 });

const getPrescriptionModel = () => {
  try {
    return mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
  } catch {
    return mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
  }
};

export const Prescription = getPrescriptionModel();
