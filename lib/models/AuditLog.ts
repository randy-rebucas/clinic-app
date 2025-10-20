import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  logId: string;
  userId: mongoose.Schema.Types.ObjectId;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'patient' | 'appointment' | 'prescription' | 'billing' | 'lab' | 'queue' | 'system' | 'security';
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  logId: { type: String, required: true, unique: true, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  resource: { type: String, required: true, trim: true },
  resourceId: { type: String, trim: true },
  details: {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    changes: { type: Schema.Types.Mixed },
  },
  ipAddress: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  timestamp: { type: Date, required: true, default: Date.now },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low' 
  },
  category: { 
    type: String, 
    enum: ['authentication', 'patient', 'appointment', 'prescription', 'billing', 'lab', 'queue', 'system', 'security'],
    required: true 
  },
  success: { type: Boolean, required: true, default: true },
  errorMessage: { type: String, trim: true },
  sessionId: { type: String, trim: true },
}, {
  timestamps: true,
});

// Indexes for efficient querying
AuditLogSchema.index({ logId: 1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ success: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });

const getAuditLogModel = () => {
  try {
    return mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
  } catch {
    return mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
  }
};

export const AuditLog = getAuditLogModel();
