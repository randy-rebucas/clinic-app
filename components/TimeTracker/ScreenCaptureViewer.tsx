'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { screenCaptureService, ScreenCapture } from '@/lib/screenCapture';
import { TimeFormat } from '@/lib/timeFormat';
import { Camera, Eye, Download, Trash2, XCircle } from 'lucide-react';

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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Screen Captures</h3>
          </div>
          <div className="text-sm text-gray-500">
            {TimeFormat.formatDate(stableDate)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalCaptures}</div>
            <div className="text-sm text-gray-500">Total Captures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeCaptures}</div>
            <div className="text-sm text-gray-500">Active Captures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</div>
            <div className="text-sm text-gray-500">Total Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.averageSize)}</div>
            <div className="text-sm text-gray-500">Avg Size</div>
          </div>
        </div>
      </div>

      {/* Captures Grid */}
      {captures.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedCapture(capture)}
              >
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <Image
                    src={capture.thumbnail}
                    alt={`Screen capture at ${TimeFormat.formatDisplayTime(capture.timestamp)}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  capture.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`} title={capture.isActive ? 'Active' : 'Inactive'} />

                {/* Time */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {TimeFormat.formatDisplayTime(capture.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Screen Captures</h3>
            <p className="text-gray-500">
              No screen captures found for {TimeFormat.formatDate(stableDate)}
            </p>
          </div>
        </div>
      )}

      {/* Capture Detail Modal */}
      {selectedCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Screen Capture</h3>
                  <div className="text-sm text-gray-500">
                    {TimeFormat.formatDateTime(selectedCapture.timestamp)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapture(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 relative w-full h-[60vh]">
                <Image
                  src={selectedCapture.imageData}
                  alt="Screen capture"
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`font-medium ${selectedCapture.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedCapture.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">File Size</div>
                  <div className="font-medium">{formatFileSize(selectedCapture.fileSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{TimeFormat.formatDisplayTime(selectedCapture.timestamp)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{TimeFormat.formatDate(selectedCapture.timestamp)}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadCapture(selectedCapture)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDeleteCapture(selectedCapture.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4" />
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
