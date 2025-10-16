'use client';

import React, { useState, useEffect } from 'react';
import { getDailySummary, getTimeEntries } from '@/lib/database';
import { DailySummary, TimeEntry } from '@/types';
import { TimeFormat } from '@/lib/timeFormat';
import { Calendar, Clock, TrendingUp, Coffee, Download } from 'lucide-react';

interface DailySummaryProps {
  employeeId: string;
  date?: Date;
}

export default function DailySummaryComponent({ employeeId, date = new Date() }: DailySummaryProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyData();
  }, [employeeId, date]);

  const loadDailyData = async () => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const [dailySummary, entries] = await Promise.all([
        getDailySummary(employeeId, dateStr),
        getTimeEntries(employeeId, date, date)
      ]);
      
      setSummary(dailySummary);
      setTimeEntries(entries);
    } catch (error) {
      console.error('Error loading daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    return TimeFormat.formatDuration(minutes);
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'clock_in':
        return '🟢';
      case 'clock_out':
        return '🔴';
      case 'break_start':
        return '☕';
      case 'break_end':
        return '⏰';
      default:
        return '⏱️';
    }
  };

  const getEntryLabel = (type: string) => {
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

  const exportToCSV = () => {
    if (!summary || timeEntries.length === 0) return;

    const csvContent = [
      ['Date', 'Clock In', 'Clock Out', 'Total Work Time', 'Total Break Time', 'Overtime'],
      [
        TimeFormat.formatDate(date),
        summary.clockInTime ? TimeFormat.formatCSVTime(summary.clockInTime) : 'N/A',
        summary.clockOutTime ? TimeFormat.formatCSVTime(summary.clockOutTime) : 'N/A',
        formatTime(summary.totalWorkTime),
        formatTime(summary.totalBreakTime),
        formatTime(summary.overtime || 0)
      ],
      [],
      ['Time Entries'],
      ['Type', 'Time', 'Notes'],
      ...timeEntries.map(entry => [
        getEntryLabel(entry.type),
        TimeFormat.formatCSVTime(entry.timestamp),
        entry.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-summary-${date.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Summary - {TimeFormat.formatDate(date)}
          </h3>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(summary.totalWorkTime)}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Work Time
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(summary.totalBreakTime)}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Coffee className="h-4 w-4 mr-1" />
                Break Time
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {summary.clockInTime ? TimeFormat.formatDisplayTime(summary.clockInTime) : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Clock In</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {summary.clockOutTime ? TimeFormat.formatDisplayTime(summary.clockOutTime) : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Clock Out</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data for this date</h3>
            <p className="text-gray-500">No time entries found for {TimeFormat.formatDate(date)}</p>
          </div>
        )}

        {summary && summary.overtime && summary.overtime > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Overtime: {formatTime(summary.overtime)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Time Entries */}
      {timeEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Entries</h3>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getEntryIcon(entry.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getEntryLabel(entry.type)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {TimeFormat.formatDisplayTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {entry.notes && (
                    <div className="text-sm text-gray-600">{entry.notes}</div>
                  )}
                  {entry.location && (
                    <div className="text-xs text-gray-500">{entry.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
