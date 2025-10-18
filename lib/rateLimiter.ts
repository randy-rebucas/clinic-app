// Simple in-memory rate limiter for production use
// In a real production environment, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Development helper functions
export function resetRateLimit(key?: string) {
  if (key) {
    rateLimitStore.delete(key);
  } else {
    rateLimitStore.clear();
  }
}

export function getRateLimitStatus(key: string) {
  const maxRequests = process.env.NODE_ENV === 'development' ? 50 : 5;
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return { count: 0, resetTime: 0, remaining: maxRequests };
  }
  
  const now = Date.now();
  if (entry.resetTime < now) {
    return { count: 0, resetTime: 0, remaining: maxRequests };
  }
  
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, maxRequests - entry.count)
  };
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (request: Request): { allowed: boolean; remaining: number; resetTime: number } => {
    const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request);
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }
    
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  };
}

function getDefaultKey(request: Request): string {
  // Use IP address as default key
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient in development
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});
