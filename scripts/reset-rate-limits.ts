#!/usr/bin/env tsx

/**
 * Development script to reset rate limits
 * Usage: npm run reset-rate-limits
 */

import { resetRateLimit } from '../lib/rateLimiter';

async function main() {
  console.log('🔄 Resetting all rate limits...');
  
  try {
    resetRateLimit(); // Reset all rate limits
    console.log('✅ All rate limits have been reset successfully!');
    console.log('💡 You can now attempt login again.');
  } catch (error) {
    console.error('❌ Failed to reset rate limits:', error);
    process.exit(1);
  }
}

// Only run in development
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script can only be run in development mode');
  process.exit(1);
}

main();
