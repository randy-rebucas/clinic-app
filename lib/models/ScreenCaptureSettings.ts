import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenCaptureSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  enabled: boolean;
  intervalMinutes: number;
  quality: number; // 0.1 to 1.0
  maxCapturesPerDay: number;
  requireUserConsent: boolean;
  useRandomTiming: boolean;
  randomVariationPercent: number; // 0-100
  burstModeEnabled: boolean;
  burstIntervalSeconds: number;
  burstDurationMinutes: number;
  burstFrequency: 'low' | 'medium' | 'high' | 'custom';
  customBurstIntervalMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScreenCaptureSettingsSchema = new Schema<IScreenCaptureSettings>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  intervalMinutes: {
    type: Number,
    default: 15,
    min: 1,
  },
  quality: {
    type: Number,
    default: 0.8,
    min: 0.1,
    max: 1.0,
  },
  maxCapturesPerDay: {
    type: Number,
    default: 32,
    min: 1,
  },
  requireUserConsent: {
    type: Boolean,
    default: true,
  },
  useRandomTiming: {
    type: Boolean,
    default: true,
  },
  randomVariationPercent: {
    type: Number,
    default: 25,
    min: 0,
    max: 100,
  },
  burstModeEnabled: {
    type: Boolean,
    default: false,
  },
  burstIntervalSeconds: {
    type: Number,
    default: 30,
    min: 30,
  },
  burstDurationMinutes: {
    type: Number,
    default: 5,
    min: 1,
  },
  burstFrequency: {
    type: String,
    enum: ['low', 'medium', 'high', 'custom'],
    default: 'medium',
  },
  customBurstIntervalMinutes: {
    type: Number,
    default: 30,
    min: 1,
  },
}, {
  timestamps: true,
});

// Indexes
ScreenCaptureSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const ScreenCaptureSettings = mongoose.models && mongoose.models.ScreenCaptureSettings || mongoose.model<IScreenCaptureSettings>('ScreenCaptureSettings', ScreenCaptureSettingsSchema);
