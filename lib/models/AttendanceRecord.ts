import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  punchInTime?: Date;
  punchOutTime?: Date;
  totalWorkingHours: number; // in hours
  totalBreakTime: number; // in hours
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  punchInTime: {
    type: Date,
  },
  punchOutTime: {
    type: Date,
  },
  totalWorkingHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalBreakTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
    default: 'absent',
  },
  lateMinutes: {
    type: Number,
    min: 0,
  },
  earlyLeaveMinutes: {
    type: Number,
    min: 0,
  },
  overtimeHours: {
    type: Number,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
AttendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceRecordSchema.index({ date: -1 });
AttendanceRecordSchema.index({ status: 1 });

export const AttendanceRecord = (mongoose.models && mongoose.models.AttendanceRecord) || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
