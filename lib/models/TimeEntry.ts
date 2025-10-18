import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeEntry extends Document {
  employeeId: mongoose.Types.ObjectId;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: Date;
  notes?: string;
  location?: string;
  ipAddress?: string;
}

const TimeEntrySchema = new Schema<ITimeEntry>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  type: {
    type: String,
    enum: ['clock_in', 'clock_out', 'break_start', 'break_end'],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
}, {
  timestamps: false,
});

// Indexes
TimeEntrySchema.index({ employeeId: 1, timestamp: -1 });
TimeEntrySchema.index({ type: 1 });
TimeEntrySchema.index({ timestamp: -1 });

// Use a function to get the model to avoid issues with mongoose.models during module evaluation
const getTimeEntryModel = () => {
  try {
    return mongoose.models?.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
  } catch {
    return mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
  }
};

export const TimeEntry = getTimeEntryModel();
