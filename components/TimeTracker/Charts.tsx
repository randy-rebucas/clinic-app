'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, TrendingUp } from 'lucide-react';

// Lazy load recharts only when needed
const RechartsComponent = dynamic(() => import('./RechartsWrapper'), {
  loading: () => (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  ),
  ssr: false // Charts typically don't need SSR
});

interface ChartsProps {
  workSessionId: string;
  employeeId: string;
}

export default function Charts({ workSessionId, employeeId }: ChartsProps) {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-purple">
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics & Charts</h3>
        </div>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="btn-primary px-3 py-2 text-sm flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </button>
      </div>

      {showCharts && (
        <RechartsComponent workSessionId={workSessionId} employeeId={employeeId} />
      )}
    </div>
  );
}
