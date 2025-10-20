import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  employeeId?: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
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
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ employeeId: 1 });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const getUserModel = () => {
  try {
    return mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
  } catch {
    return mongoose.model<IUser>('User', UserSchema);
  }
};

export const User = getUserModel();

