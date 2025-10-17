'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DailySummary, TimeEntry } from '@/types';
import { TimeFormat } from '@/lib/timeFormat';
import { Calendar, Clock, Coffee, Download, BarChart3, Target, Award, Activity } from 'lucide-react';

interface DailySummaryProps {
  employeeId: string;
  date?: Date;
}

export default function DailySummaryComponent({ employeeId, date = new Date() }: DailySummaryProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDailyData = useCallback(async () => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Fetch daily summary from API
      const summaryResponse = await fetch(`/api/daily-summary?employeeId=${employeeId}&date=${dateStr}`);
      const summaryData = summaryResponse.ok ? await summaryResponse.json() : { data: null };
      const dailySummary = summaryData.data;
      
      // Fetch time entries from API
      const entriesResponse = await fetch(`/api/time-entries?employeeId=${employeeId}&startDate=${date.toISOString()}&endDate=${date.toISOString()}`);
      const entriesData = entriesResponse.ok ? await entriesResponse.json() : { data: [] };
      const entries = entriesData.data;
      
      setSummary(dailySummary ? {
        id: dailySummary._id.toString(),
        employeeId: dailySummary.employeeId.toString(),
        date: dailySummary.date,
        totalWorkTime: dailySummary.totalWorkTime,
        totalBreakTime: dailySummary.totalBreakTime,
        clockInTime: dailySummary.clockInTime,
        clockOutTime: dailySummary.clockOutTime,
        workSessions: dailySummary.workSessions.map(session => session.toString()),
        status: dailySummary.status,
        overtime: dailySummary.overtime
      } : null);
      setTimeEntries(entries.map(entry => ({
        id: entry._id.toString(),
        employeeId: entry.employeeId.toString(),
        type: entry.type,
        timestamp: entry.timestamp,
        notes: entry.notes
      })));
    } catch (error) {
      console.error('Failed to load daily data:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, date]);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

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
    <div className="space-y-3">
      {summary ? (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Work Time */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Work Time</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatTime(summary.totalWorkTime)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((summary.totalWorkTime / 480) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {Math.round((summary.totalWorkTime / 480) * 100)}% of 8h goal
              </div>
            </div>

            {/* Break Time */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Coffee className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Break Time</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatTime(summary.totalBreakTime)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-1.5">
                <div 
                  className="bg-yellow-600 dark:bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((summary.totalBreakTime / 60) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {Math.round((summary.totalBreakTime / 60) * 100)}% of 1h typical
              </div>
            </div>

            {/* Clock In */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Activity className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Clock In</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {summary.clockInTime ? TimeFormat.formatDisplayTime(summary.clockInTime) : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {summary.clockInTime ? 'Started work' : 'Not clocked in'}
              </div>
            </div>

            {/* Clock Out */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Clock Out</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {summary.clockOutTime ? TimeFormat.formatDisplayTime(summary.clockOutTime) : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                {summary.clockOutTime ? 'Ended work' : 'Still working'}
              </div>
            </div>
          </div>

          {/* Overtime Alert */}
          {summary.overtime && summary.overtime > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Overtime Detected</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    {formatTime(summary.overtime)} beyond 8-hour goal
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatTime(summary.overtime)}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Overtime</div>
                </div>
              </div>
            </div>
          )}

          {/* Productivity Insights */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <BarChart3 className="h-3 w-3 text-slate-600 dark:text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Productivity Insights</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((summary.totalWorkTime / Math.max(summary.totalWorkTime + summary.totalBreakTime, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Productivity Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {summary.totalWorkTime > 0 ? Math.round(summary.totalWorkTime / 60) : 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Hours Worked</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {summary.totalBreakTime > 0 ? Math.round(summary.totalBreakTime / 15) : 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Break Sessions</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit mx-auto mb-3">
            <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No data for this date</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No time entries found for {TimeFormat.formatDate(date)}</p>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Clock in to start tracking your time
          </div>
        </div>
      )}

      {/* Time Entries */}
      {timeEntries.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Time Entries</h3>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {timeEntries.map((entry, index) => (
              <div key={entry.id} className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-3 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-500/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-sm">{getEntryIcon(entry.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {getEntryLabel(entry.type)}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {TimeFormat.formatDisplayTime(entry.timestamp)}
                      </div>
                      {entry.notes && (
                        <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 italic">
                          &ldquo;{entry.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.location && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        📍 {entry.location}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connection line to next entry */}
                {index < timeEntries.length - 1 && (
                  <div className="absolute left-7 top-12 w-0.5 h-3 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
