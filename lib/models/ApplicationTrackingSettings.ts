import mongoose, { Document, Schema } from 'mongoose';

export interface IApplicationTrackingSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  enabled: boolean;
  trackApplications: boolean;
  trackWebsites: boolean;
  trackWindowTitles: boolean;
  samplingInterval: number; // seconds between samples
  maxIdleTime: number; // seconds before considering inactive
  categoryRules: {
    [key: string]: string; // process name or domain -> category
  };
  privacyMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationTrackingSettingsSchema = new Schema<IApplicationTrackingSettings>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  trackApplications: {
    type: Boolean,
    default: true,
  },
  trackWebsites: {
    type: Boolean,
    default: true,
  },
  trackWindowTitles: {
    type: Boolean,
    default: true,
  },
  samplingInterval: {
    type: Number,
    default: 5,
    min: 1,
  },
  maxIdleTime: {
    type: Number,
    default: 30,
    min: 1,
  },
  categoryRules: {
    type: Map,
    of: String,
    default: {},
  },
  privacyMode: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
ApplicationTrackingSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const ApplicationTrackingSettings = (mongoose.models && mongoose.models.ApplicationTrackingSettings) || mongoose.model<IApplicationTrackingSettings>('ApplicationTrackingSettings', ApplicationTrackingSettingsSchema);
