'use client';

import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface AdvancedDateUtilsProps {
  date?: Date;
}

export default function AdvancedDateUtils({ date = new Date() }: AdvancedDateUtilsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  const handleShowAdvanced = async () => {
    if (!showAdvanced) {
      // Lazy load date-fns only when needed
      const { format, formatDistanceToNow, isToday, isYesterday } = await import('date-fns');
      
      const advancedFormat = format(date, 'EEEE, MMMM do, yyyy');
      const relativeTime = formatDistanceToNow(date, { addSuffix: true });
      const isTodayDate = isToday(date);
      const isYesterdayDate = isYesterday(date);
      
      setFormattedDate(`${advancedFormat} (${relativeTime})${isTodayDate ? ' - Today' : isYesterdayDate ? ' - Yesterday' : ''}`);
    }
    setShowAdvanced(!showAdvanced);
  };

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-info">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Date Utils</h3>
        </div>
        <button
          onClick={handleShowAdvanced}
          className="btn-primary px-3 py-2 text-sm flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Advanced Format:</strong> {formattedDate}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            💡 This component demonstrates lazy loading of the date-fns library. 
            The library is only loaded when you click &quot;Show Advanced&quot;, reducing the initial bundle size.
          </div>
        </div>
      )}
    </div>
  );
}
