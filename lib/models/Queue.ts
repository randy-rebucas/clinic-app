import mongoose, { Document, Schema } from 'mongoose';

export interface IQueue extends Document {
  queueId: string;
  patientId: string;
  appointmentId?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  assignedDoctorId?: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  estimatedWaitTime?: number; // in minutes
  actualWaitTime?: number; // in minutes
  calledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueSchema = new Schema<IQueue>({
  queueId: {
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
  appointmentId: {
    type: String,
    ref: 'Appointment',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'emergency'],
    default: 'normal',
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  assignedDoctorId: {
    type: String,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting',
  },
  estimatedWaitTime: Number,
  actualWaitTime: Number,
  calledAt: Date,
  startedAt: Date,
  completedAt: Date,
  notes: String,
}, {
  timestamps: true,
});

QueueSchema.index({ queueId: 1 });
QueueSchema.index({ patientId: 1 });
QueueSchema.index({ status: 1 });
QueueSchema.index({ priority: 1 });
QueueSchema.index({ assignedDoctorId: 1 });
QueueSchema.index({ createdAt: 1 });

const getQueueModel = () => {
  try {
    return mongoose.models.Queue || mongoose.model<IQueue>('Queue', QueueSchema);
  } catch {
    return mongoose.model<IQueue>('Queue', QueueSchema);
  }
};

export const Queue = getQueueModel();
