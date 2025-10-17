import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenCapture extends Document {
  employeeId: mongoose.Types.ObjectId;
  workSessionId: mongoose.Types.ObjectId;
  timestamp: Date;
  imageData: string; // Base64 encoded image
  thumbnail: string; // Base64 encoded thumbnail
  fileSize: number;
  isActive: boolean; // Whether user was actively working
}

const ScreenCaptureSchema = new Schema<IScreenCapture>({
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
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  imageData: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: false,
});


// Virtual for id field
ScreenCaptureSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
ScreenCaptureSchema.set('toJSON', {
  virtuals: true
});

// Indexes
ScreenCaptureSchema.index({ employeeId: 1, timestamp: -1 });
ScreenCaptureSchema.index({ workSessionId: 1 });
ScreenCaptureSchema.index({ timestamp: -1 });

export const ScreenCapture = (mongoose.models && mongoose.models.ScreenCapture) || mongoose.model<IScreenCapture>('ScreenCapture', ScreenCaptureSchema);
