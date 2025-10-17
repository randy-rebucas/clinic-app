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
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Only access global on the server side
if (typeof window === 'undefined') {
  if (global.mongoose) {
    cached = global.mongoose;
  } else {
    cached = { conn: null, promise: null };
    global.mongoose = cached;
  }
} else {
  // On the client side, initialize a local cache
  cached = { conn: null, promise: null };
}

async function connectDB() {
  // Don't connect to MongoDB on the client side
  if (typeof window !== 'undefined') {
    throw new Error('MongoDB connection should only be used on the server side');
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseConnection) => {
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
