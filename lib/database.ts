import connectDB from './mongodb';
import { Types } from 'mongoose';
import { User, IUser } from './models/User';

// User Management (auth-only)
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
}) => {
  await connectDB();
  const user = new User(userData);
  const savedUser = await user.save();
  return savedUser._id.toString();
};

export const getUser = async (userId: string): Promise<IUser | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (User as any).findById(userId);
  return user;
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (User as any).findOne({ email });
  return user;
};

