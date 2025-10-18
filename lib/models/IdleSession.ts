import mongoose, { Document, Schema } from 'mongoose';

export interface IIdleSession extends Document {
  workSessionId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  reason: 'inactivity' | 'manual' | 'system';
  notes?: string;
  status: 'active' | 'completed';
}

const IdleSessionSchema = new Schema<IIdleSession>({
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
  reason: {
    type: String,
    enum: ['inactivity', 'manual', 'system'],
    required: true,
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
IdleSessionSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
IdleSessionSchema.set('toJSON', {
  virtuals: true
});

// Indexes
IdleSessionSchema.index({ workSessionId: 1, status: 1 });
IdleSessionSchema.index({ startTime: -1 });

// Use a function to get the model to avoid issues with mongoose.models during module evaluation
const getModel = () => {
  try {
    return mongoose.models.IdleSession || mongoose.model<IIdleSession>('IdleSession', IdleSessionSchema);
  } catch {
    return mongoose.model<IIdleSession>('IdleSession', IdleSessionSchema);
  }
};

export const IdleSession = getModel();
