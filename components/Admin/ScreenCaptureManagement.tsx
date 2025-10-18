'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { TimeFormat } from '@/lib/timeFormat';
import { 
  Camera, Search, Download, Trash2, Eye, XCircle, RefreshCw, AlertTriangle, 
  Filter, X, User, Clock
} from 'lucide-react';

interface ScreenCapture {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  workSessionId?: string;
  timestamp: Date;
  imageData: string;
  thumbnail: string;
  fileSize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

export default function ScreenCaptureManagement() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // UI states
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [selectedCaptures, setSelectedCaptures] = useState<string[]>([]);

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/screen-captures');
      
      if (!response.ok) {
        throw new Error('Failed to fetch screen captures');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match our interface
        const transformedCaptures: ScreenCapture[] = data.data.map((capture: {
          id: string;
          employeeId: string;
          employeeName: string;
          employeeEmail: string;
          workSessionId?: string;
          timestamp: string;
          imageData: string;
          thumbnail: string;
          fileSize: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: capture.id,
          employeeId: capture.employeeId,
          employeeName: capture.employeeName,
          employeeEmail: capture.employeeEmail,
          workSessionId: capture.workSessionId,
          timestamp: new Date(capture.timestamp),
          imageData: capture.imageData,
          thumbnail: capture.thumbnail,
          fileSize: capture.fileSize,
          isActive: capture.isActive,
          createdAt: new Date(capture.createdAt),
          updatedAt: new Date(capture.updatedAt)
        }));
        
        setCaptures(transformedCaptures);
        setEmployees(data.employees || []);
      } else {
        throw new Error(data.error || 'Failed to load screen captures');
      }
    } catch (err) {
      console.error('Error loading captures:', err);
      setError(err instanceof Error ? err.message : 'Failed to load screen captures');
      setCaptures([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered captures
  const filteredCaptures = useMemo(() => {
    return captures.filter(capture => {
      const matchesSearch = searchTerm === '' || 
        capture.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        capture.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        capture.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (capture.workSessionId && capture.workSessionId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEmployee = filterEmployee === '' || capture.employeeId === filterEmployee;
      const matchesDate = filterDate === '' || capture.timestamp.toISOString().split('T')[0] === filterDate;
      
      return matchesSearch && matchesEmployee && matchesDate;
    });
  }, [captures, searchTerm, filterEmployee, filterDate]);

  // Handle bulk selection
  // const handleSelectAll = () => {
  //   if (selectedCaptures.length === filteredCaptures.length) {
  //     setSelectedCaptures([]);
  //   } else {
  //     setSelectedCaptures(filteredCaptures.map(capture => capture.id));
  //   }
  // };

  const handleSelectCapture = (captureId: string) => {
    setSelectedCaptures(prev => 
      prev.includes(captureId) 
        ? prev.filter(id => id !== captureId)
        : [...prev, captureId]
    );
  };

  const handleDeleteCapture = async (captureId: string) => {
    if (!confirm('Are you sure you want to delete this screen capture?')) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/screen-captures/delete?id=${captureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete screen capture');
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload captures to get the updated list
        await loadCaptures();
        if (selectedCapture?.id === captureId) {
          setSelectedCapture(null);
        }
        // Remove from selected captures if it was selected
        setSelectedCaptures(prev => prev.filter(id => id !== captureId));
      } else {
        throw new Error(data.error || 'Failed to delete screen capture');
      }
    } catch (error) {
      console.error('Error deleting capture:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete screen capture');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCaptures.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCaptures.length} screen captures?`)) {
      return;
    }

    try {
      setActionLoading(true);

      // Delete captures one by one
      for (const captureId of selectedCaptures) {
        const response = await fetch(`/api/admin/screen-captures/delete?id=${captureId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete capture ${captureId}`);
        }
      }

      // Reload captures and clear selection
      await loadCaptures();
      setSelectedCaptures([]);
      if (selectedCapture && selectedCaptures.includes(selectedCapture.id)) {
        setSelectedCapture(null);
      }
    } catch (error) {
      console.error('Error bulk deleting captures:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete screen captures');
    } finally {
      setActionLoading(false);
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

  const stats = useMemo(() => {
    const totalCaptures = filteredCaptures.length;
    const activeCaptures = filteredCaptures.filter(c => c.isActive).length;
    const totalSize = filteredCaptures.reduce((sum, c) => sum + c.fileSize, 0);
    const uniqueEmployees = new Set(filteredCaptures.map(c => c.employeeId)).size;
    
    return { totalCaptures, activeCaptures, totalSize, uniqueEmployees };
  }, [filteredCaptures]);

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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Screen Captures</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadCaptures}
            className="btn-primary px-4 py-2 text-sm flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Screen Capture Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and view employee screen captures
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCaptures}
            disabled={loading || actionLoading}
            className="btn-secondary flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || actionLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {filteredCaptures.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={actionLoading}
              className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </button>
          )}
        </div>
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

      {/* Search and Filter Controls */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, email, or session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 pr-4"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showFilters || filterEmployee !== '' || filterDate !== ''
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {(filterEmployee !== '' || filterDate !== '') && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {[filterEmployee !== '', filterDate !== ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee
                </label>
                <select
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Captures Grid */}
      {filteredCaptures.length > 0 ? (
        <div className="card overflow-hidden">
          {/* Grid Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Screen Captures ({filteredCaptures.length})
                </h3>
                {selectedCaptures.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedCaptures.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedCaptures([])}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              {/* Bulk Actions */}
              {selectedCaptures.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={actionLoading}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid Content */}
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCaptures.map((capture) => (
                <div
                  key={capture.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedCaptures.includes(capture.id) 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCaptures.includes(capture.id)}
                      onChange={() => handleSelectCapture(capture.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Image */}
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative"
                    onClick={() => setSelectedCapture(capture)}
                  >
                    <Image
                      src={capture.thumbnail}
                      alt={`Screen capture at ${TimeFormat.formatDisplayTime(capture.timestamp)}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
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
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
                    <div className="truncate font-medium">{capture.employeeName}</div>
                    <div className="flex items-center justify-between">
                      <span>{TimeFormat.formatDisplayTime(capture.timestamp)}</span>
                      <span className="text-gray-300">{formatFileSize(capture.fileSize)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <div className="empty-state py-8">
            <Camera className="empty-state-icon h-10 w-10" />
            <div className="empty-state-title">
              {searchTerm || filterEmployee !== '' || filterDate !== '' 
                ? 'No Screen Captures Match Your Filters' 
                : 'No Screen Captures Found'
              }
            </div>
            <div className="empty-state-description">
              {searchTerm || filterEmployee !== '' || filterDate !== ''
                ? 'Try adjusting your search or filter criteria'
                : 'Screen captures will appear here when employees are being tracked'
              }
            </div>
            {(searchTerm || filterEmployee !== '' || filterDate !== '') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterEmployee('');
                  setFilterDate('');
                }}
                className="btn-secondary px-4 py-2 text-sm mt-4"
              >
                Clear Filters
              </button>
            )}
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee</div>
                  <div className="flex items-center justify-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{selectedCapture.employeeName}</div>
                      <div className="text-xs text-gray-500">{selectedCapture.employeeEmail}</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                  <div className={`font-medium text-sm flex items-center justify-center space-x-1 ${
                    selectedCapture.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${selectedCapture.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{selectedCapture.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">File Size</div>
                  <div className="font-medium text-sm">{formatFileSize(selectedCapture.fileSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Captured</div>
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="font-medium text-sm">{TimeFormat.formatDisplayTime(selectedCapture.timestamp)}</div>
                  </div>
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
