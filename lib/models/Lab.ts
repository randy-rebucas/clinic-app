import mongoose, { Document, Schema } from 'mongoose';

export interface ILabTest {
  testName: string;
  testCode: string;
  normalRange?: string;
  unit?: string;
  value?: string | number;
  status: 'pending' | 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export interface ILabOrder extends Document {
  labOrderId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  tests: ILabTest[];
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  orderedDate: Date;
  completedDate?: Date;
  labTechnician?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LabTestSchema = new Schema<ILabTest>({
  testName: {
    type: String,
    required: true,
    trim: true,
  },
  testCode: {
    type: String,
    required: true,
    trim: true,
  },
  normalRange: String,
  unit: String,
  value: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'normal', 'abnormal', 'critical'],
    default: 'pending',
  },
  notes: String,
});

const LabOrderSchema = new Schema<ILabOrder>({
  labOrderId: {
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
  tests: [LabTestSchema],
  status: {
    type: String,
    enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
    default: 'ordered',
  },
  orderedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  completedDate: Date,
  labTechnician: {
    type: String,
    ref: 'User',
  },
  notes: String,
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
}, {
  timestamps: true,
});

LabOrderSchema.index({ labOrderId: 1 });
LabOrderSchema.index({ patientId: 1 });
LabOrderSchema.index({ doctorId: 1 });
LabOrderSchema.index({ status: 1 });
LabOrderSchema.index({ orderedDate: 1 });

const getLabOrderModel = () => {
  try {
    return mongoose.models.LabOrder || mongoose.model<ILabOrder>('LabOrder', LabOrderSchema);
  } catch {
    return mongoose.model<ILabOrder>('LabOrder', LabOrderSchema);
  }
};

export const LabOrder = getLabOrderModel();
