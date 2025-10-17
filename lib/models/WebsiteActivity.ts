import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsiteActivity extends Document {
  employeeId: mongoose.Types.ObjectId;
  workSessionId: mongoose.Types.ObjectId;
  domain: string;
  url: string;
  pageTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isActive: boolean;
  category?: 'work' | 'social' | 'news' | 'entertainment' | 'shopping' | 'education' | 'other';
  productivity?: 'productive' | 'neutral' | 'distracting';
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteActivitySchema = new Schema<IWebsiteActivity>({
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
  domain: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  pageTitle: {
    type: String,
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
    enum: ['work', 'social', 'news', 'entertainment', 'shopping', 'education', 'other'],
  },
  productivity: {
    type: String,
    enum: ['productive', 'neutral', 'distracting'],
  },
}, {
  timestamps: true,
});

// Indexes
WebsiteActivitySchema.index({ employeeId: 1, workSessionId: 1 });
WebsiteActivitySchema.index({ workSessionId: 1, isActive: 1 });
WebsiteActivitySchema.index({ startTime: -1 });
WebsiteActivitySchema.index({ domain: 1 });
WebsiteActivitySchema.index({ category: 1 });
WebsiteActivitySchema.index({ productivity: 1 });

export const WebsiteActivity = (mongoose.models && mongoose.models.WebsiteActivity) || mongoose.model<IWebsiteActivity>('WebsiteActivity', WebsiteActivitySchema);
