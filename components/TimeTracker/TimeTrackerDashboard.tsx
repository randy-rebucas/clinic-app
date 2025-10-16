'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeTrackingService } from '@/lib/timeTracking';
import { getActiveWorkSession, getActiveBreakSession } from '@/lib/database';
import { WorkSession, BreakSession } from '@/types';
import NavBar from '@/components/Navigation/NavBar';
import DailySummaryComponent from './DailySummary';
import { notificationService } from '@/lib/notifications';
import { 
  Clock, 
  Play, 
  Pause, 
  Coffee, 
  LogOut, 
  User, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function TimeTrackerDashboard() {
  const { user, employee, logout } = useAuth();
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [breakSession, setBreakSession] = useState<BreakSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load active sessions on component mount
  useEffect(() => {
    if (user) {
      loadActiveSessions();
      // Request notification permission
      notificationService.requestPermission();
    }
  }, [user]);

  const loadActiveSessions = async () => {
    if (!user) return;
    
    try {
      const [activeWorkSession, activeBreakSession] = await Promise.all([
        getActiveWorkSession(user.uid),
        workSession ? getActiveBreakSession(workSession.id) : null
      ]);
      
      setWorkSession(activeWorkSession);
      setBreakSession(activeBreakSession);
    } catch (err) {
      console.error('Error loading active sessions:', err);
    }
  };

  const handleClockIn = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.clockIn({
        employeeId: user.uid,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      await loadActiveSessions();
      notificationService.showClockInSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.clockOut({
        employeeId: user.uid,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      await loadActiveSessions();
      notificationService.showClockOutSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (!workSession) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.startBreak({
        workSessionId: workSession.id,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      await loadActiveSessions();
      notificationService.showBreakStartSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to start break');
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    if (!workSession) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.endBreak(workSession.id, notes.trim() || undefined);
      setNotes('');
      await loadActiveSessions();
      notificationService.showBreakEndSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to end break');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = () => {
    return TimeTrackingService.getCurrentStatus(workSession, breakSession);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return 'Working';
      case 'on_break':
        return 'On Break';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
              <div className="mt-2 flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
                  {getStatusText(currentStatus)}
                </span>
                {workSession && (
                  <span className="text-sm text-gray-600">
                    Since {workSession.clockInTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Time Tracking</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Notes Input */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about your work or break..."
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!workSession ? (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Clock In</span>
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                disabled={loading || currentStatus === 'on_break'}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Clock Out</span>
              </button>
            )}

            {workSession && !breakSession ? (
              <button
                onClick={handleStartBreak}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Coffee className="h-5 w-5" />
                <span>Start Break</span>
              </button>
            ) : workSession && breakSession ? (
              <button
                onClick={handleEndBreak}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Pause className="h-5 w-5" />
                <span>End Break</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center space-x-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed"
              >
                <Coffee className="h-5 w-5" />
                <span>Start Break</span>
              </button>
            )}
          </div>
        </div>

        {/* Session Info */}
        {workSession && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(workSession.clockInTime)}
                </div>
                <div className="text-sm text-gray-500">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {TimeTrackingService.formatTime(workSession.totalBreakTime)}
                </div>
                <div className="text-sm text-gray-500">Break Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {TimeTrackingService.formatTime(workSession.totalWorkTime)}
                </div>
                <div className="text-sm text-gray-500">Work Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Summary */}
        {user && (
          <div className="mt-8">
            <DailySummaryComponent employeeId={user.uid} />
          </div>
        )}
      </div>
    </div>
  );
}
