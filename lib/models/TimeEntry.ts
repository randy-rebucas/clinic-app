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

export const TimeEntry = mongoose.models && mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
