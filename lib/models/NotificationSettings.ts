import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  clockInReminder: boolean;
  clockOutReminder: boolean;
  breakReminder: boolean;
  overtimeAlert: boolean;
  reminderTime: number; // minutes before end of workday
  breakReminderTime: number; // minutes for break reminders
}

const NotificationSettingsSchema = new Schema<INotificationSettings>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  clockInReminder: {
    type: Boolean,
    default: true,
  },
  clockOutReminder: {
    type: Boolean,
    default: true,
  },
  breakReminder: {
    type: Boolean,
    default: true,
  },
  overtimeAlert: {
    type: Boolean,
    default: true,
  },
  reminderTime: {
    type: Number,
    default: 15, // 15 minutes before end of workday
    min: 0,
  },
  breakReminderTime: {
    type: Number,
    default: 60, // 60 minutes for break reminders
    min: 0,
  },
}, {
  timestamps: false,
});

// Indexes
NotificationSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const NotificationSettings = mongoose.models && mongoose.models.NotificationSettings || mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
