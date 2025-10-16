'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { attendanceTrackingService, AttendanceRecord, AttendanceSummary, AttendanceSettings } from '@/lib/attendanceTracking';
import { getAttendanceRecords, getAttendanceSettings } from '@/lib/database';
import { TimeFormat } from '@/lib/timeFormat';

interface AttendanceDashboardProps {
  employeeId: string;
}

export default function AttendanceDashboard({ employeeId }: AttendanceDashboardProps) {
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [punchingIn, setPunchingIn] = useState(false);
  const [punchingOut, setPunchingOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  const loadAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load current attendance
      const current = await attendanceTrackingService.getTodayAttendanceRecord(employeeId);
      setCurrentAttendance(current);

      // Load attendance history
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }
      
      const history = await getAttendanceRecords(employeeId, startDate, endDate);
      setAttendanceHistory(history.map(record => ({
        id: record._id.toString(),
        employeeId: record.employeeId.toString(),
        date: record.date,
        punchInTime: record.punchInTime,
        punchOutTime: record.punchOutTime,
        totalWorkingHours: record.totalWorkingHours,
        totalBreakTime: record.totalBreakTime,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      })));

      // Load attendance summary
      const summary = await attendanceTrackingService.getAttendanceSummary(employeeId, startDate, endDate);
      setAttendanceSummary(summary);

      // Load attendance settings
      const settings = await getAttendanceSettings(employeeId);
      setAttendanceSettings(settings ? {
        id: settings._id.toString(),
        employeeId: settings.employeeId.toString(),
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        breakDuration: settings.breakDuration,
        lateThreshold: settings.lateThreshold,
        earlyLeaveThreshold: settings.earlyLeaveThreshold,
        overtimeThreshold: settings.overtimeThreshold,
        workingDays: settings.workingDays,
        timezone: settings.timezone,
        requireLocation: settings.requireLocation,
        allowRemoteWork: settings.allowRemoteWork,
        autoPunchOut: settings.autoPunchOut,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      } : null);

    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedPeriod]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const handlePunchIn = async () => {
    try {
      setPunchingIn(true);
      
      // Get current location if available
      let location;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.warn('Could not get location:', error);
        }
      }

      await attendanceTrackingService.punchIn(employeeId, {
        location,
        notes: 'Punched in via dashboard',
        isManual: false,
      });

      await loadAttendanceData();
    } catch (error) {
      console.error('Error punching in:', error);
      alert('Failed to punch in. Please try again.');
    } finally {
      setPunchingIn(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunchingOut(true);
      
      // Get current location if available
      let location;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.warn('Could not get location:', error);
        }
      }

      await attendanceTrackingService.punchOut(employeeId, {
        location,
        notes: 'Punched out via dashboard',
        isManual: false,
      });

      await loadAttendanceData();
    } catch (error) {
      console.error('Error punching out:', error);
      alert('Failed to punch out. Please try again.');
    } finally {
      setPunchingOut(false);
    }
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'half_day':
        return <Minus className="h-5 w-5 text-orange-600" />;
      case 'on_leave':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'half_day':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={loadAttendanceData}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Attendance</h3>
          <div className="flex items-center gap-2">
            {currentAttendance && getStatusIcon(currentAttendance.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentAttendance?.status || 'absent')}`}>
              {currentAttendance?.status?.replace('_', ' ').toUpperCase() || 'ABSENT'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(currentAttendance?.punchInTime)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Punch In</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(currentAttendance?.punchOutTime)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Punch Out</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentAttendance?.totalWorkingHours ? 
                TimeFormat.formatDuration(currentAttendance.totalWorkingHours * 60) : 
                '--:--'
              }
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Hours</div>
          </div>
        </div>

        {/* Punch In/Out Buttons */}
        <div className="flex gap-3 justify-center">
          {!currentAttendance?.punchInTime ? (
            <button
              onClick={handlePunchIn}
              disabled={punchingIn}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {punchingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Punching In...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Punch In
                </>
              )}
            </button>
          ) : !currentAttendance?.punchOutTime ? (
            <button
              onClick={handlePunchOut}
              disabled={punchingOut}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {punchingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Punching Out...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  Punch Out
                </>
              )}
            </button>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p>Day completed</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {currentAttendance && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {currentAttendance.lateMinutes && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Late by:</span>
                  <span className="ml-2 font-medium text-yellow-600">
                    {currentAttendance.lateMinutes} minutes
                  </span>
                </div>
              )}
              {currentAttendance.overtimeHours && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Overtime:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {TimeFormat.formatDuration(currentAttendance.overtimeHours * 60)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Summary */}
      {attendanceSummary && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Summary</h3>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendanceSummary.presentDays}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Present Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {attendanceSummary.absentDays}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Absent Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceSummary.lateDays}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Late Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(attendanceSummary.attendanceRate)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Working Hours:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {TimeFormat.formatDuration(attendanceSummary.totalWorkingHours * 60)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Average Daily:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {TimeFormat.formatDuration(attendanceSummary.averageWorkingHours * 60)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Punctuality Score:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {attendanceSummary.punctualityScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Attendance</h3>
        
        <div className="space-y-3">
          {attendanceHistory.slice(0, 7).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(record.date)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(record.punchInTime)} - {formatTime(record.punchOutTime)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {TimeFormat.formatDuration(record.totalWorkingHours * 60)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {record.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && attendanceSettings && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Work Hours:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {attendanceSettings.workStartTime} - {attendanceSettings.workEndTime}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Break Duration:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {attendanceSettings.breakDuration} minutes
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Late Threshold:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {attendanceSettings.lateThreshold} minutes
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Working Days:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {attendanceSettings.workingDays.length} days/week
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
