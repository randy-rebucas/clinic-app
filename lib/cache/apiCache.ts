'use client';

import { useState, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum number of entries (default: 100)
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get data from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.recordMiss();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.recordMiss();
      return null;
    }

    this.recordHit();
    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Get cache entries for external access
   */
  getEntries() {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : (this.hitCount / total) * 100;
  }

  private recordHit(): void {
    this.hitCount++;
  }

  private recordMiss(): void {
    this.missCount++;
  }
}

// Create singleton instance
const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
});

// Clean up expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

/**
 * Cache key generators for different data types
 */
export const CacheKeys = {
  activeWorkSession: (employeeId: string) => `active-work-session-${employeeId}`,
  activeBreakSession: (employeeId: string) => `active-break-session-${employeeId}`,
  dailySummary: (employeeId: string, date: string) => `daily-summary-${employeeId}-${date}`,
  applicationActivities: (workSessionId: string) => `app-activities-${workSessionId}`,
  websiteActivities: (workSessionId: string) => `website-activities-${workSessionId}`,
  screenCaptures: (employeeId: string, date: string) => `screen-captures-${employeeId}-${date}`,
  employee: (employeeId: string) => `employee-${employeeId}`,
  employees: () => 'all-employees',
  idleSettings: (employeeId: string) => `idle-settings-${employeeId}`,
} as const;

/**
 * Generic cached fetch function
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey: string,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Hook for cached API calls
 */
export function useCachedAPI<T>(
  url: string,
  cacheKey: string,
  options: RequestInit = {},
  ttl?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a stable options object to avoid dependency issues
  const stableOptions = JSON.stringify(options);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await cachedFetch<T>(url, JSON.parse(stableOptions), cacheKey, ttl);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, cacheKey, stableOptions, ttl]);

  return { data, loading, error };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string | RegExp): void {
  const keys = apiCache.getEntries();
  
  for (const key of keys) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    } else {
      if (pattern.test(key)) {
        apiCache.delete(key);
      }
    }
  }
}

/**
 * Preload frequently accessed data
 */
export async function preloadCriticalData(employeeId: string): Promise<void> {
  const promises = [
    cachedFetch(
      `/api/work-sessions/active?employeeId=${employeeId}`,
      {},
      CacheKeys.activeWorkSession(employeeId),
      2 * 60 * 1000 // 2 minutes TTL
    ),
    cachedFetch(
      `/api/break-sessions/active?employeeId=${employeeId}`,
      {},
      CacheKeys.activeBreakSession(employeeId),
      2 * 60 * 1000 // 2 minutes TTL
    ),
    cachedFetch(
      `/api/daily-summary?employeeId=${employeeId}&date=${new Date().toISOString().split('T')[0]}`,
      {},
      CacheKeys.dailySummary(employeeId, new Date().toISOString().split('T')[0]),
      10 * 60 * 1000 // 10 minutes TTL
    )
  ];

  try {
    await Promise.allSettled(promises);
  } catch (error) {
    console.warn('Failed to preload some critical data:', error);
  }
}

export { apiCache };
export default apiCache;
