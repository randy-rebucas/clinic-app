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


// Virtual for id field
BreakSessionSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
BreakSessionSchema.set('toJSON', {
  virtuals: true
});

// Indexes
BreakSessionSchema.index({ workSessionId: 1, status: 1 });
BreakSessionSchema.index({ startTime: -1 });

// Use a function to get the model to avoid issues with mongoose.models during module evaluation
const getBreakSessionModel = () => {
  try {
    return mongoose.models?.BreakSession || mongoose.model<IBreakSession>('BreakSession', BreakSessionSchema);
  } catch {
    return mongoose.model<IBreakSession>('BreakSession', BreakSessionSchema);
  }
};

export const BreakSession = getBreakSessionModel();
