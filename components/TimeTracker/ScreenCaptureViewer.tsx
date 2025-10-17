'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { screenCaptureService, ScreenCapture } from '@/lib/screenCapture';
import { TimeFormat } from '@/lib/timeFormat';
import { Camera, Eye, Download, Trash2, XCircle } from 'lucide-react';
import VirtualScroll from '@/components/VirtualScroll/VirtualScroll';

// Lazy load Next.js Image component for better performance
const Image = dynamic(() => import('next/image'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full"></div>
});

interface ScreenCaptureViewerProps {
  employeeId: string;
  workSessionId?: string;
  date?: Date;
}

export default function ScreenCaptureViewerComponent({ 
  employeeId, 
  workSessionId, 
  date 
}: ScreenCaptureViewerProps) {
  // Use a stable date reference to prevent infinite re-renders
  const [stableDate] = useState(() => date || new Date());
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCaptures: 0,
    activeCaptures: 0,
    totalSize: 0,
    averageSize: 0,
  });

  const loadCaptures = useCallback(() => {
    try {
      // Check if employeeId is valid before making API calls
      if (!employeeId || employeeId === 'undefined') {
        console.warn('ScreenCaptureViewer: employeeId is undefined or invalid:', employeeId);
        setLoading(false);
        return;
      }

      let loadedCaptures: ScreenCapture[];
      
      if (workSessionId) {
        loadedCaptures = screenCaptureService.getCapturesForSession(workSessionId);
      } else {
        loadedCaptures = screenCaptureService.getCapturesForEmployee(employeeId, stableDate);
      }
      
      setCaptures(loadedCaptures);
      setStats(screenCaptureService.getStats(employeeId, stableDate));
    } catch (error) {
      console.error('Failed to load captures:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, workSessionId, stableDate]);

  useEffect(() => {
    loadCaptures();
  }, [loadCaptures]);

  const handleDeleteCapture = (captureId: string) => {
    if (confirm('Are you sure you want to delete this screen capture?')) {
      const success = screenCaptureService.deleteCapture(captureId);
      if (success) {
        loadCaptures();
        if (selectedCapture?.id === captureId) {
          setSelectedCapture(null);
        }
      }
    }
  };

  const handleDownloadCapture = (capture: ScreenCapture) => {
    const link = document.createElement('a');
    link.href = capture.imageData;
    link.download = `screen-capture-${capture.timestamp.toISOString().split('T')[0]}-${capture.timestamp.getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="card p-3">
        <div className="loading-header h-3 w-1/4"></div>
        <div className="space-y-2">
          <div className="loading-line h-2"></div>
          <div className="loading-line-medium h-2"></div>
          <div className="loading-line-short h-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header and Stats */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Screen Captures</h3>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {TimeFormat.formatDate(stableDate)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCaptures}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.activeCaptures}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Size</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatFileSize(stats.averageSize)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Size</div>
          </div>
        </div>
      </div>

      {/* Captures Virtual Scroll */}
      {captures.length > 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
          <VirtualScroll
            items={captures}
            itemHeight={120} // Height for each capture item
            containerHeight={400} // Fixed height for the scroll container
            renderItem={(capture: ScreenCapture) => (
              <div className="p-1">
                <div
                  className="relative group cursor-pointer bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCapture(capture)}
                >
                  <div className="flex gap-3 p-2">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden relative">
                      <Image
                        src={capture.thumbnail}
                        alt={`Screen capture at ${TimeFormat.formatDisplayTime(capture.timestamp)}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              capture.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {TimeFormat.formatDateTime(capture.timestamp)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {TimeFormat.formatDisplayTime(capture.timestamp)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Size: {formatFileSize(capture.fileSize)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCapture(capture);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Download"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCapture(capture.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCapture(capture);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="View"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No screen captures found"
            showScrollToTop={true}
            showScrollToBottom={true}
          />
        </div>
      ) : (
        <div className="card p-3">
          <div className="empty-state py-6">
            <Camera className="empty-state-icon h-8 w-8" />
            <div className="empty-state-title">No Screen Captures</div>
            <div className="empty-state-description">
              No screen captures found for {TimeFormat.formatDate(stableDate)}
            </div>
            <div className="empty-state-subtitle">
              Screen captures will appear here when enabled
            </div>
          </div>
        </div>
      )}

      {/* Capture Detail Modal */}
      {selectedCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Camera className="h-4 w-4 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Screen Capture</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {TimeFormat.formatDateTime(selectedCapture.timestamp)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapture(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3 relative w-full h-[50vh]">
                <Image
                  src={selectedCapture.imageData}
                  alt="Screen capture"
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                  <div className={`text-sm font-medium ${selectedCapture.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {selectedCapture.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">File Size</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{formatFileSize(selectedCapture.fileSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{TimeFormat.formatDisplayTime(selectedCapture.timestamp)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{TimeFormat.formatDate(selectedCapture.timestamp)}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDownloadCapture(selectedCapture)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDeleteCapture(selectedCapture.id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
