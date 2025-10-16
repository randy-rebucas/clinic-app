'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Pause, 
  Play
} from 'lucide-react';
import { TimeTrackingService } from '@/lib/timeTracking';

interface IdleWarningProps {
  isVisible: boolean;
  onClose: () => void;
  onGoIdle: () => void;
  onKeepActive: () => void;
  timeRemaining: number; // seconds
}

export default function IdleWarning({ 
  isVisible, 
  onClose, 
  onGoIdle, 
  onKeepActive, 
  timeRemaining 
}: IdleWarningProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(timeRemaining);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onGoIdle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeRemaining, onGoIdle]);

  if (!isVisible) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Idle Warning
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You&apos;ll be marked as idle soon
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-orange-600 dark:text-orange-400 mb-2">
            {formatTime(countdown)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {countdown > 0 ? 'Time remaining before going idle' : 'Going idle now...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${Math.max(0, (countdown / timeRemaining) * 100)}%` 
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onKeepActive}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Play className="h-4 w-4" />
            Keep Active
          </button>
          
          <button
            onClick={onGoIdle}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Go Idle
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Hook for managing idle warning state
export function useIdleWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute default

  const showWarning = (seconds: number = 60) => {
    setTimeRemaining(seconds);
    setIsVisible(true);
  };

  const hideWarning = () => {
    setIsVisible(false);
  };

  const handleGoIdle = async () => {
    try {
      await TimeTrackingService.manualStartIdle('Auto-idle from warning');
      hideWarning();
    } catch (error) {
      console.error('Failed to go idle:', error);
    }
  };

  const handleKeepActive = () => {
    hideWarning();
    // Reset activity detection
    // This would be handled by the inactivity detection service
  };

  return {
    isVisible,
    timeRemaining,
    showWarning,
    hideWarning,
    handleGoIdle,
    handleKeepActive,
  };
}
