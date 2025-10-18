import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  workStartTime: string; // Format: "HH:MM"
  workEndTime: string; // Format: "HH:MM"
  breakDuration: number; // Break duration in minutes
  lateThreshold: number; // Late threshold in minutes
  earlyLeaveThreshold: number; // Early leave threshold in minutes
  overtimeThreshold: number; // Overtime threshold in minutes
  workingDays: number[]; // Array of working days (0 = Sunday, 1 = Monday, etc.)
  timezone: string; // Timezone for the employee
  requireLocation: boolean; // Whether location is required for clock in/out
  allowRemoteWork: boolean; // Whether remote work is allowed
  autoPunchOut: boolean; // Whether to automatically punch out at end time
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSettingsSchema = new Schema<IAttendanceSettings>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  workStartTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  workEndTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  breakDuration: {
    type: Number,
    required: true,
    min: 0,
    max: 480 // Maximum 8 hours break
  },
  lateThreshold: {
    type: Number,
    required: true,
    min: 0,
    max: 120 // Maximum 2 hours late threshold
  },
  earlyLeaveThreshold: {
    type: Number,
    required: true,
    min: 0,
    max: 120 // Maximum 2 hours early leave threshold
  },
  overtimeThreshold: {
    type: Number,
    required: true,
    min: 0,
    max: 480 // Maximum 8 hours overtime threshold
  },
  workingDays: {
    type: [Number],
    required: true,
    validate: {
      validator: function(days: number[]) {
        return days.length > 0 && days.length <= 7 && 
               days.every(day => day >= 0 && day <= 6);
      },
      message: 'Working days must be an array of numbers between 0-6 (Sunday-Saturday)'
    }
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  },
  requireLocation: {
    type: Boolean,
    required: true,
    default: false
  },
  allowRemoteWork: {
    type: Boolean,
    required: true,
    default: true
  },
  autoPunchOut: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
AttendanceSettingsSchema.index({ employeeId: 1 });

export const AttendanceSettings = mongoose.models.AttendanceSettings || 
  mongoose.model<IAttendanceSettings>('AttendanceSettings', AttendanceSettingsSchema);
