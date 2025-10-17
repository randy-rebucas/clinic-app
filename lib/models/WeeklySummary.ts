import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklySummary extends Document {
  employeeId: mongoose.Types.ObjectId;
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  dailySummaries: mongoose.Types.ObjectId[]; // Array of daily summary IDs
  averageWorkTime: number; // in minutes
  overtime: number; // in minutes
}

const WeeklySummarySchema = new Schema<IWeeklySummary>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  weekStart: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  weekEnd: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  totalWorkTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalBreakTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  dailySummaries: [{
    type: Schema.Types.ObjectId,
    ref: 'DailySummary',
  }],
  averageWorkTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: false,
});


// Virtual for id field
WeeklySummarySchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
WeeklySummarySchema.set('toJSON', {
  virtuals: true
});

// Indexes
WeeklySummarySchema.index({ employeeId: 1, weekStart: 1 }, { unique: true });
WeeklySummarySchema.index({ weekStart: -1 });

export const WeeklySummary = (mongoose.models && mongoose.models.WeeklySummary) || mongoose.model<IWeeklySummary>('WeeklySummary', WeeklySummarySchema);
