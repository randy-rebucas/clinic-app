'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  showScrollToTop?: boolean;
  showScrollToBottom?: boolean;
}

export default function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  emptyMessage = 'No items to display',
  showScrollToTop = true,
  showScrollToBottom = true,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({
    top: false,
    bottom: false,
  });

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);

    // Update scroll button visibility
    const maxScroll = totalHeight - containerHeight;
    setShowScrollButtons({
      top: newScrollTop > 100,
      bottom: newScrollTop < maxScroll - 100,
    });
  }, [onScroll, totalHeight, containerHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({ 
        top: totalHeight, 
        behavior: 'smooth' 
      });
    }
  }, [totalHeight]);

  // Reset scroll when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Scroll buttons */}
      {showScrollToTop && showScrollButtons.top && (
        <button
          onClick={scrollToTop}
          className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Scroll to top"
        >
          <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {showScrollToBottom && showScrollButtons.bottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Scroll to bottom"
        >
          <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Virtual scroll container */}
      <div
        ref={scrollElementRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          <div
            style={{
              transform: `translateY(${startIndex * itemHeight}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map(({ item, index }) => (
              <div
                key={index}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-150"
          style={{
            width: `${Math.min(100, (containerHeight / totalHeight) * 100)}%`,
            transform: `translateX(${(scrollTop / (totalHeight - containerHeight)) * (100 - (containerHeight / totalHeight) * 100)}%)`,
          }}
        />
      </div>
    </div>
  );
}

// Hook for virtual scroll state
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleItems,
    totalHeight: items.length * itemHeight,
  };
}

// Higher-order component for easier usage
export function withVirtualScroll<P extends object>(
  Component: React.ComponentType<P>,
  virtualScrollProps: Partial<VirtualScrollProps<unknown>>
) {
  return function VirtualScrollWrapper(props: P) {
    // Ensure all required properties have default values
    const safeVirtualScrollProps = {
      items: virtualScrollProps.items || [],
      itemHeight: virtualScrollProps.itemHeight || 50,
      containerHeight: virtualScrollProps.containerHeight || 300,
      renderItem: virtualScrollProps.renderItem || (() => null),
      ...virtualScrollProps,
    };
    
    return (
      <VirtualScroll {...safeVirtualScrollProps}>
        {(item: unknown, index: number) => (
          <Component key={index} {...props} item={item} index={index} />
        )}
      </VirtualScroll>
    );
  };
}
