import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmployee extends Document {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  password: {
    type: String,
    required: true,
    minlength: 6,
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

// Hash password before saving
EmployeeSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
EmployeeSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Use a function to get the model to avoid issues with mongoose.models during module evaluation
const getEmployeeModel = () => {
  try {
    return mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
  } catch {
    return mongoose.model<IEmployee>('Employee', EmployeeSchema);
  }
};

export const Employee = getEmployeeModel();
