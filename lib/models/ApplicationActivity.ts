import mongoose, { Document, Schema } from 'mongoose';

export interface IApplicationActivity extends Document {
  employeeId: mongoose.Types.ObjectId;
  workSessionId: mongoose.Types.ObjectId;
  applicationName: string;
  windowTitle: string;
  processName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isActive: boolean;
  category?: 'productivity' | 'communication' | 'development' | 'design' | 'browsing' | 'entertainment' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationActivitySchema = new Schema<IApplicationActivity>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  workSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkSession',
    required: true,
  },
  applicationName: {
    type: String,
    required: true,
    trim: true,
  },
  windowTitle: {
    type: String,
    trim: true,
  },
  processName: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['productivity', 'communication', 'development', 'design', 'browsing', 'entertainment', 'other'],
  },
}, {
  timestamps: true,
});


// Virtual for id field
ApplicationActivitySchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
ApplicationActivitySchema.set('toJSON', {
  virtuals: true
});

// Indexes
ApplicationActivitySchema.index({ employeeId: 1, workSessionId: 1 });
ApplicationActivitySchema.index({ workSessionId: 1, isActive: 1 });
ApplicationActivitySchema.index({ startTime: -1 });
ApplicationActivitySchema.index({ category: 1 });

export const ApplicationActivity = (mongoose.models && mongoose.models.ApplicationActivity) || mongoose.model<IApplicationActivity>('ApplicationActivity', ApplicationActivitySchema);
