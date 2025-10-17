import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsiteTrackingSettings extends Document {
  employeeId: mongoose.Types.ObjectId;
  enabled: boolean;
  trackWebsites: boolean;
  trackPageTitles: boolean;
  trackFullUrls: boolean;
  samplingInterval: number; // seconds between samples
  maxIdleTime: number; // seconds before considering inactive
  categoryRules: {
    [key: string]: string; // domain -> category
  };
  productivityRules: {
    [key: string]: string; // domain -> productivity level
  };
  privacyMode: boolean;
  blocklist: string[]; // domains to not track
  allowlist: string[]; // domains to always track
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteTrackingSettingsSchema = new Schema<IWebsiteTrackingSettings>({
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
  trackWebsites: {
    type: Boolean,
    default: true,
  },
  trackPageTitles: {
    type: Boolean,
    default: true,
  },
  trackFullUrls: {
    type: Boolean,
    default: false,
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
  productivityRules: {
    type: Map,
    of: String,
    default: {},
  },
  privacyMode: {
    type: Boolean,
    default: false,
  },
  blocklist: [{
    type: String,
    trim: true,
  }],
  allowlist: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});


// Virtual for id field
WebsiteTrackingSettingsSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
WebsiteTrackingSettingsSchema.set('toJSON', {
  virtuals: true
});

// Indexes
WebsiteTrackingSettingsSchema.index({ employeeId: 1 }, { unique: true });

export const WebsiteTrackingSettings = (mongoose.models && mongoose.models.WebsiteTrackingSettings) || mongoose.model<IWebsiteTrackingSettings>('WebsiteTrackingSettings', WebsiteTrackingSettingsSchema);
