'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RateLimitReset() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resetRateLimit = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/dev/reset-rate-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Reset all rate limits
      });

      if (!response.ok) {
        throw new Error('Failed to reset rate limit');
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset rate limit');
    } finally {
      setLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Rate Limit Reset
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Hit rate limit? Reset it here for development.
          </p>
          
          {message && (
            <div className="mt-2 flex items-center text-xs text-green-700 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          
          <button
            onClick={resetRateLimit}
            disabled={loading}
            className="mt-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-xs px-3 py-1 rounded flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Resetting...' : 'Reset Rate Limit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
