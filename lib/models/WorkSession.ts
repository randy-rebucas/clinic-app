import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkSession extends Document {
  employeeId: mongoose.Types.ObjectId;
  clockInTime: Date;
  clockOutTime?: Date;
  totalBreakTime: number; // in minutes
  totalWorkTime: number; // in minutes
  notes?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const WorkSessionSchema = new Schema<IWorkSession>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  clockInTime: {
    type: Date,
    required: true,
  },
  clockOutTime: {
    type: Date,
  },
  totalBreakTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalWorkTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Indexes
WorkSessionSchema.index({ employeeId: 1, status: 1 });
WorkSessionSchema.index({ clockInTime: -1 });
WorkSessionSchema.index({ status: 1 });

export const WorkSession = (mongoose.models && mongoose.models.WorkSession) || mongoose.model<IWorkSession>('WorkSession', WorkSessionSchema);
