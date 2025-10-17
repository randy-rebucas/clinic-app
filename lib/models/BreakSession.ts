import mongoose, { Document, Schema } from 'mongoose';

export interface IBreakSession extends Document {
  workSessionId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  status: 'active' | 'completed';
}

const BreakSessionSchema = new Schema<IBreakSession>({
  workSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkSession',
    required: true,
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
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: false,
});

// Indexes
BreakSessionSchema.index({ workSessionId: 1, status: 1 });
BreakSessionSchema.index({ startTime: -1 });

export const BreakSession = (mongoose.models && mongoose.models.BreakSession) || mongoose.model<IBreakSession>('BreakSession', BreakSessionSchema);
