import mongoose, { Document, Schema } from 'mongoose';

export interface IDailySummary extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  clockInTime?: Date;
  clockOutTime?: Date;
  workSessions: mongoose.Types.ObjectId[]; // Array of work session IDs
  status: 'incomplete' | 'complete';
  overtime?: number; // in minutes
}

const DailySummarySchema = new Schema<IDailySummary>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  totalWorkTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalBreakTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  clockInTime: {
    type: Date,
  },
  clockOutTime: {
    type: Date,
  },
  workSessions: [{
    type: Schema.Types.ObjectId,
    ref: 'WorkSession',
  }],
  status: {
    type: String,
    enum: ['incomplete', 'complete'],
    default: 'incomplete',
  },
  overtime: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: false,
});

// Indexes
DailySummarySchema.index({ employeeId: 1, date: 1 }, { unique: true });
DailySummarySchema.index({ date: -1 });
DailySummarySchema.index({ status: 1 });

export const DailySummary = (mongoose.models && mongoose.models.DailySummary) || mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);
