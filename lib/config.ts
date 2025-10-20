// MongoDB Configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin_db_user:RSOrq2XA4yYzJSCY@main.3sjcnia.mongodb.net/clinic-app?retryWrites=true&w=majority&appName=main';

// Only throw error if we're in a server environment and the URI is not set
if (typeof window === 'undefined' && !process.env.MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not set. Using default connection string.');
}
