import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee',
  },
  department: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ department: 1 });

export const Employee = (mongoose.models && mongoose.models && mongoose.models.Employee) || mongoose.model<IEmployee>('Employee', EmployeeSchema);
