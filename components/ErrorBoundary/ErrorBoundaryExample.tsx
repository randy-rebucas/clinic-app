'use client';

import React, { useState } from 'react';
import ErrorBoundary, { withErrorBoundary } from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';

// Example component that can throw errors
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a test error from BuggyComponent!');
  }
  
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-700 dark:text-green-300">
          Component is working correctly!
        </span>
      </div>
    </div>
  );
}

// Component wrapped with HOC
const SafeBuggyComponent = withErrorBoundary(BuggyComponent, {
  level: 'component',
  showDetails: true
});

export default function ErrorBoundaryExample() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [shouldThrowHOC, setShouldThrowHOC] = useState(false);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Error Boundary Examples
          </h2>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          These examples demonstrate how Error Boundaries catch and handle JavaScript errors in React components.
        </p>

        {/* Example 1: Direct ErrorBoundary usage */}
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Example 1: Direct ErrorBoundary Wrapper
            </h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShouldThrow(!shouldThrow)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  shouldThrow
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                }`}
              >
                {shouldThrow ? 'Fix Component' : 'Break Component'}
              </button>
            </div>
            
            <ErrorBoundary level="component" showDetails={true}>
              <BuggyComponent shouldThrow={shouldThrow} />
            </ErrorBoundary>
          </div>

          {/* Example 2: HOC usage */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Example 2: Higher-Order Component (HOC)
            </h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShouldThrowHOC(!shouldThrowHOC)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  shouldThrowHOC
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                }`}
              >
                {shouldThrowHOC ? 'Fix Component' : 'Break Component'}
              </button>
            </div>
            
            <SafeBuggyComponent shouldThrow={shouldThrowHOC} />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            How to Use Error Boundaries:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Wrap components that might throw errors</li>
            <li>• Use different levels: &apos;page&apos;, &apos;section&apos;, &apos;component&apos;</li>
            <li>• Enable showDetails in development for debugging</li>
            <li>• Use HOC for reusable error handling</li>
            <li>• Error boundaries catch errors in render methods and lifecycle methods</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
