'use client';

import React, { useState, useMemo } from 'react';
import VirtualScroll from './VirtualScroll';
import { Users, Globe, Monitor, Camera } from 'lucide-react';

interface ExampleItem {
  id: string;
  name: string;
  type: 'user' | 'website' | 'app' | 'capture';
  timestamp: Date;
  size?: number;
}

export default function VirtualScrollExample() {
  const [itemCount, setItemCount] = useState(1000);

  // Generate mock data
  const items = useMemo(() => {
    const types: ExampleItem['type'][] = ['user', 'website', 'app', 'capture'];
    const names = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson',
      'google.com', 'github.com', 'stackoverflow.com', 'youtube.com',
      'VS Code', 'Chrome', 'Slack', 'Discord',
      'Screenshot 1', 'Screenshot 2', 'Screenshot 3', 'Screenshot 4'
    ];

    return Array.from({ length: itemCount }, (_, index) => ({
      id: `item-${index}`,
      name: names[index % names.length],
      type: types[index % types.length],
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      size: Math.floor(Math.random() * 1000000) + 1000, // Random size
    }));
  }, [itemCount]);

  const getItemIcon = (type: ExampleItem['type']) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'website': return <Globe className="h-4 w-4 text-green-600" />;
      case 'app': return <Monitor className="h-4 w-4 text-purple-600" />;
      case 'capture': return <Camera className="h-4 w-4 text-orange-600" />;
    }
  };

  const getTypeColor = (type: ExampleItem['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'website': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'app': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'capture': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Virtual Scroll Example
          </h2>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This example demonstrates virtual scrolling with {itemCount.toLocaleString()} items. 
          Only visible items are rendered, providing smooth performance even with large datasets.
        </p>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Item Count:
          </label>
          <select
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={100}>100 items</option>
            <option value={1000}>1,000 items</option>
            <option value={10000}>10,000 items</option>
            <option value={100000}>100,000 items</option>
          </select>
        </div>

        {/* Virtual Scroll Container */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <VirtualScroll
            items={items}
            itemHeight={60}
            containerHeight={400}
            renderItem={(item: ExampleItem) => (
              <div className="p-1">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getItemIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  {item.size && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            emptyMessage="No items to display"
            showScrollToTop={true}
            showScrollToBottom={true}
          />
        </div>

        {/* Performance Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Performance Benefits:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Only renders visible items (~10-15 items at a time)</li>
            <li>• Smooth scrolling regardless of total item count</li>
            <li>• Memory efficient - no DOM bloat</li>
            <li>• Built-in scroll indicators and navigation</li>
            <li>• Customizable item heights and container sizes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
