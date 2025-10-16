'use client';

import React, { useState, useEffect } from 'react';
// import { getTimeEntries } from '@/lib/database';
import { TimeEntry } from '@/types';
import { TimeFormat } from '@/lib/timeFormat';
import { Clock, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function TimeEntryManagement() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    // This would fetch time entries from the database
    // For now, using mock data
    const mockEntries: TimeEntry[] = [
      {
        id: '1',
        employeeId: 'employee1',
        type: 'clock_in',
        timestamp: new Date('2024-01-15T09:00:00'),
        notes: 'Started work day',
        location: 'Office',
      },
      {
        id: '2',
        employeeId: 'employee1',
        type: 'break_start',
        timestamp: new Date('2024-01-15T12:00:00'),
        notes: 'Lunch break',
      },
      {
        id: '3',
        employeeId: 'employee1',
        type: 'break_end',
        timestamp: new Date('2024-01-15T13:00:00'),
        notes: 'Back from lunch',
      },
      {
        id: '4',
        employeeId: 'employee1',
        type: 'clock_out',
        timestamp: new Date('2024-01-15T17:00:00'),
        notes: 'End of work day',
        location: 'Office',
      },
    ];
    
    setTimeEntries(mockEntries);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clock_in':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'clock_out':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'break_start':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'break_end':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clock_in':
        return 'Clock In';
      case 'clock_out':
        return 'Clock Out';
      case 'break_start':
        return 'Break Start';
      case 'break_end':
        return 'Break End';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clock_in':
        return 'bg-green-100 text-green-800';
      case 'clock_out':
        return 'bg-red-100 text-red-800';
      case 'break_start':
        return 'bg-yellow-100 text-yellow-800';
      case 'break_end':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesDate = !filterDate || entry.timestamp.toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-500">Loading time entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Time Entry Management</h3>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee or notes..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">
              Entry Type
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="clock_in">Clock In</option>
              <option value="clock_out">Clock Out</option>
              <option value="break_start">Break Start</option>
              <option value="break_end">Break End</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTypeIcon(entry.type)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {getTypeLabel(entry.type)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.employeeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{TimeFormat.formatDate(entry.timestamp)}</div>
                    <div className="text-gray-500">{TimeFormat.formatDisplayTime(entry.timestamp)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.notes || 'No notes'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.location || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Handle edit
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this time entry?')) {
                          // Handle delete
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
