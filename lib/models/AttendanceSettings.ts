import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  workStartTime: string; // HH:MM format
  workEndTime: string; // HH:MM format
  breakDuration: number; // in minutes
  lateThreshold: number; // minutes after start time
  earlyLeaveThreshold: number; // minutes before end time
  overtimeThreshold: number; // hours after scheduled end
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
  requireLocation: boolean;
  allowRemoteWork: boolean;
  autoPunchOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSettingsSchema = new Schema<IAttendanceSettings>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  workStartTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  workEndTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  breakDuration: {
    type: Number,
    default: 60,
    min: 0,
  },
  lateThreshold: {
    type: Number,
    default: 15,
    min: 0,
  },
  earlyLeaveThreshold: {
    type: Number,
    default: 15,
    min: 0,
  },
  overtimeThreshold: {
    type: Number,
    default: 0,
    min: 0,
  },
  workingDays: [{
    type: Number,
    min: 0,
    max: 6,
  }],
  timezone: {
    type: String,
    default: 'UTC',
  },
  requireLocation: {
    type: Boolean,
    default: false,
  },
  allowRemoteWork: {
    type: Boolean,
    default: true,
  },
  autoPunchOut: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
AttendanceSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const AttendanceSettings = mongoose.models && mongoose.models.AttendanceSettings || mongoose.model<IAttendanceSettings>('AttendanceSettings', AttendanceSettingsSchema);
