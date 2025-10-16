import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceReport extends Document {
  employeeId?: mongoose.Types.ObjectId; // null for all employees
  startDate: string;
  endDate: string;
  totalWorkTime: number;
  totalBreakTime: number;
  workDays: number;
  averageWorkTime: number;
  overtime: number;
  generatedAt: Date;
  generatedBy: mongoose.Types.ObjectId; // admin user ID
}

const AttendanceReportSchema = new Schema<IAttendanceReport>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  startDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  endDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  totalWorkTime: {
    type: Number,
    required: true,
    min: 0,
  },
  totalBreakTime: {
    type: Number,
    required: true,
    min: 0,
  },
  workDays: {
    type: Number,
    required: true,
    min: 0,
  },
  averageWorkTime: {
    type: Number,
    required: true,
    min: 0,
  },
  overtime: {
    type: Number,
    required: true,
    min: 0,
  },
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
}, {
  timestamps: false,
});

// Indexes
AttendanceReportSchema.index({ employeeId: 1, generatedAt: -1 });
AttendanceReportSchema.index({ generatedBy: 1 });
AttendanceReportSchema.index({ generatedAt: -1 });

export const AttendanceReport = mongoose.models && mongoose.models.AttendanceReport || mongoose.model<IAttendanceReport>('AttendanceReport', AttendanceReportSchema);
