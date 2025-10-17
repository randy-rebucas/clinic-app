'use client';

import { useState, useEffect, useRef } from 'react';

interface UseOptimizedTimerOptions {
  interval?: number; // milliseconds between updates
  enabled?: boolean; // whether timer is active
  precision?: 'second' | 'minute' | 'hour'; // update precision
}

/**
 * Optimized timer hook that uses requestAnimationFrame for smooth updates
 * and reduces unnecessary re-renders by only updating when the display value changes
 */
export function useOptimizedTimer(options: UseOptimizedTimerOptions = {}) {
  const {
    interval = 1000, // 1 second default
    enabled = true,
    precision = 'second'
  } = options;

  const [time, setTime] = useState(() => new Date());
  const [displayTime, setDisplayTime] = useState(() => new Date());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateTime = (currentTime: number) => {
      // Only update if enough time has passed
      if (currentTime - lastUpdateRef.current >= interval) {
        const newTime = new Date();
        setTime(newTime);

        // Only update display time if the precision value has changed
        const shouldUpdateDisplay = (() => {
          switch (precision) {
            case 'second':
              return newTime.getSeconds() !== displayTime.getSeconds();
            case 'minute':
              return newTime.getMinutes() !== displayTime.getMinutes();
            case 'hour':
              return newTime.getHours() !== displayTime.getHours();
            default:
              return true;
          }
        })();

        if (shouldUpdateDisplay) {
          setDisplayTime(newTime);
        }

        lastUpdateRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, interval, precision, displayTime]);

  return {
    time,
    displayTime,
    isActive: enabled
  };
}

/**
 * Hook for dashboard time display with optimized updates
 */
export function useDashboardTimer() {
  return useOptimizedTimer({
    interval: 1000, // Update every second
    precision: 'second',
    enabled: true
  });
}

/**
 * Hook for session timer with higher precision
 */
export function useSessionTimer() {
  return useOptimizedTimer({
    interval: 100, // Update every 100ms for smooth timer display
    precision: 'second',
    enabled: true
  });
}

/**
 * Hook for idle detection with lower frequency
 */
export function useIdleTimer() {
  return useOptimizedTimer({
    interval: 5000, // Update every 5 seconds
    precision: 'minute',
    enabled: true
  });
}
