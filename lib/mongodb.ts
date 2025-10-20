import mongoose from 'mongoose';
import { MONGODB_URI } from './config';

declare global {
  var mongoose: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conn: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promise: any;
  };
}

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | null = null;

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  // Server-side: use global object
  cached = (global as typeof globalThis & { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;
  
  if (!cached) {
    cached = (global as typeof globalThis & { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = { conn: null, promise: null };
  }
} else {
  // Client-side: create a simple cache object
  cached = { conn: null, promise: null };
}

async function connectDB() {
  // If we're in a browser environment, don't actually connect to MongoDB
  if (typeof window !== 'undefined') {
    console.warn('MongoDB connection attempted in browser environment. This should only be used in API routes.');
    return null;
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseConnection) => {
      console.log('Connected to MongoDB successfully');
      return mongooseConnection;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;

// Export as connectToDatabase for backward compatibility
export const connectToDatabase = async () => {
  const connection = await connectDB();
  if (!connection) {
    throw new Error('Failed to connect to database');
  }
  return { db: connection.connection.db };
};