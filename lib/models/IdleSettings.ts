import mongoose, { Document, Schema } from 'mongoose';

export interface IIdleSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  enabled: boolean;
  idleThresholdMinutes: number;
  pauseTimerOnIdle: boolean;
  showIdleWarning: boolean;
  warningTimeMinutes: number;
  autoResumeOnActivity: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IdleSettingsSchema = new Schema<IIdleSettings>({
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
  idleThresholdMinutes: {
    type: Number,
    default: 5,
    min: 1,
  },
  pauseTimerOnIdle: {
    type: Boolean,
    default: true,
  },
  showIdleWarning: {
    type: Boolean,
    default: true,
  },
  warningTimeMinutes: {
    type: Number,
    default: 1,
    min: 0,
  },
  autoResumeOnActivity: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
IdleSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const IdleSettings = mongoose.models && mongoose.models.IdleSettings || mongoose.model<IIdleSettings>('IdleSettings', IdleSettingsSchema);
