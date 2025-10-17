'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { screenCaptureService, ScreenCapture } from '@/lib/screenCapture';
import { TimeFormat } from '@/lib/timeFormat';
import { Camera, Search, Download, Trash2, Eye, XCircle } from 'lucide-react';

export default function ScreenCaptureManagement() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [employees, setEmployees] = useState<string[]>([]);

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = () => {
    try {
      // In a real implementation, you would fetch from a database
      // For now, we'll get all captures from localStorage
      const allCaptures: ScreenCapture[] = JSON.parse(localStorage.getItem('screenCaptures') || '[]');
      setCaptures(allCaptures);
      
      // Extract unique employee IDs
      const uniqueEmployees = [...new Set(allCaptures.map(capture => capture.employeeId))];
      setEmployees(uniqueEmployees);
    } catch (error) {
      console.error('Error loading captures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCaptures = captures.filter(capture => {
    const matchesSearch = capture.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capture.workSessionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = !filterEmployee || capture.employeeId === filterEmployee;
    const matchesDate = !filterDate || capture.timestamp.toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesEmployee && matchesDate;
  });

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
    link.download = `screen-capture-${capture.employeeId}-${capture.timestamp.toISOString().split('T')[0]}-${capture.timestamp.getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    filteredCaptures.forEach((capture, index) => {
      setTimeout(() => {
        handleDownloadCapture(capture);
      }, index * 100); // Stagger downloads
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStats = () => {
    const totalCaptures = filteredCaptures.length;
    const activeCaptures = filteredCaptures.filter(c => c.isActive).length;
    const totalSize = filteredCaptures.reduce((sum, c) => sum + c.fileSize, 0);
    const uniqueEmployees = new Set(filteredCaptures.map(c => c.employeeId)).size;
    
    return { totalCaptures, activeCaptures, totalSize, uniqueEmployees };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-500">Loading screen captures...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          Screen Capture Management
        </h3>
        {filteredCaptures.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCaptures}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Captures</div>
        </div>
        <div className="card p-3">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.activeCaptures}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Active Captures</div>
        </div>
        <div className="card p-3">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatFileSize(stats.totalSize)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Size</div>
        </div>
        <div className="card p-3">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.uniqueEmployees}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Employees</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee or session..."
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="filterEmployee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employee
            </label>
            <select
              id="filterEmployee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="input-field"
            >
              <option value="">All Employees</option>
              {employees.map(employeeId => (
                <option key={employeeId} value={employeeId}>{employeeId}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Captures Grid */}
      {filteredCaptures.length > 0 ? (
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredCaptures.map((capture) => (
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

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
                  <div className="truncate">{capture.employeeId}</div>
                  <div>{TimeFormat.formatDisplayTime(capture.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <div className="empty-state py-8">
            <Camera className="empty-state-icon h-10 w-10" />
            <div className="empty-state-title">No Screen Captures Found</div>
            <div className="empty-state-description">No screen captures match your current filters.</div>
          </div>
        </div>
      )}

      {/* Capture Detail Modal */}
      {selectedCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">Screen Capture Details</h3>
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
              <div className="mb-4 relative w-full h-[60vh]">
                <Image
                  src={selectedCapture.imageData}
                  alt="Screen capture"
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Employee</div>
                  <div className="font-medium text-sm">{selectedCapture.employeeId}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                  <div className={`font-medium text-sm ${selectedCapture.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {selectedCapture.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">File Size</div>
                  <div className="font-medium text-sm">{formatFileSize(selectedCapture.fileSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Session ID</div>
                  <div className="font-medium text-sm">{selectedCapture.workSessionId}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDownloadCapture(selectedCapture)}
                  className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDeleteCapture(selectedCapture.id)}
                  className="btn-danger flex items-center space-x-2 px-3 py-2 text-sm"
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
