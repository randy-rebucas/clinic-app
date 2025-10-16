import mongoose, { Document, Schema } from 'mongoose';

export interface IPunchRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  attendanceRecordId: mongoose.Types.ObjectId;
  punchType: 'in' | 'out';
  punchTime: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
    ipAddress?: string;
  };
  isManual: boolean;
  notes?: string;
  createdAt: Date;
}

const PunchRecordSchema = new Schema<IPunchRecord>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  attendanceRecordId: {
    type: Schema.Types.ObjectId,
    ref: 'AttendanceRecord',
    required: true,
  },
  punchType: {
    type: String,
    enum: ['in', 'out'],
    required: true,
  },
  punchTime: {
    type: Date,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  deviceInfo: {
    userAgent: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  isManual: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
PunchRecordSchema.index({ employeeId: 1, punchTime: -1 });
PunchRecordSchema.index({ attendanceRecordId: 1 });
PunchRecordSchema.index({ punchType: 1 });

export const PunchRecord = mongoose.models && mongoose.models.PunchRecord || mongoose.model<IPunchRecord>('PunchRecord', PunchRecordSchema);
