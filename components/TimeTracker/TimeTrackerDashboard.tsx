'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeTrackingService } from '@/lib/timeTracking';
import { WorkSession, BreakSession } from '@/types';
import NavBar from '@/components/Navigation/NavBar';
import DailySummaryComponent from './DailySummary';
import { notificationService } from '@/lib/notifications';
import { TimeFormat } from '@/lib/timeFormat';
import { screenCaptureService } from '@/lib/screenCapture';
import { networkDetectionService } from '@/lib/networkDetection';
import { syncService } from '@/lib/syncService';
import { offlineStorageService } from '@/lib/offlineStorage';
import { idleManagementService } from '@/lib/idleManagement';
import { applicationTrackingService } from '@/lib/applicationTracking';
import { websiteTrackingService } from '@/lib/websiteTracking';
import { attendanceTrackingService } from '@/lib/attendanceTracking';
import ScreenCaptureSettingsComponent from './ScreenCaptureSettings';
import ScreenCaptureViewerComponent from './ScreenCaptureViewer';
import PrivacyNotificationComponent from './PrivacyNotification';
import OfflineStatusComponent from './OfflineStatus';
import IdleStatusComponent from './IdleStatus';
import IdleWarningComponent, { useIdleWarning } from './IdleWarning';
import ApplicationUsage from './ApplicationUsage';
import WebsiteUsage from './WebsiteUsage';
import TrackingSettings from './TrackingSettings';
import AttendanceDashboard from './AttendanceDashboard';
import { 
  Play, 
  Pause, 
  Coffee, 
  LogOut, 
  AlertCircle,
  Camera,
  Settings,
  Eye,
  Clock,
  Timer,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Target,
  Award
} from 'lucide-react';

export default function TimeTrackerDashboard() {
  const { user } = useAuth();
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [breakSession, setBreakSession] = useState<BreakSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScreenCaptureSettings, setShowScreenCaptureSettings] = useState(false);
  const [showScreenCaptures, setShowScreenCaptures] = useState(false);
  const [showPrivacyNotification, setShowPrivacyNotification] = useState(false);
  const [showTrackingSettings, setShowTrackingSettings] = useState(false);
  const [currentDate] = useState(() => new Date());
  
  // Idle warning hook
  const idleWarning = useIdleWarning();

  const loadActiveSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch active work session from API
      const workSessionResponse = await fetch(`/api/work-sessions/active?employeeId=${user.id}`);
      if (!workSessionResponse.ok) {
        throw new Error('Failed to fetch active work session');
      }
      const workSessionData = await workSessionResponse.json();
      const activeWorkSession = workSessionData.data;
      
      setWorkSession(activeWorkSession ? {
        id: activeWorkSession._id.toString(),
        employeeId: activeWorkSession.employeeId.toString(),
        clockInTime: activeWorkSession.clockInTime,
        totalBreakTime: activeWorkSession.totalBreakTime,
        totalWorkTime: activeWorkSession.totalWorkTime,
        status: activeWorkSession.status,
        createdAt: activeWorkSession.createdAt,
        updatedAt: activeWorkSession.updatedAt
      } : null);
      
      // Load break session only if we have an active work session
      if (activeWorkSession) {
        const breakSessionResponse = await fetch(`/api/break-sessions/active?employeeId=${user.id}`);
        if (breakSessionResponse.ok) {
          const breakSessionData = await breakSessionResponse.json();
          const activeBreakSession = breakSessionData.data;
          
          setBreakSession(activeBreakSession ? {
            id: activeBreakSession._id.toString(),
            workSessionId: activeBreakSession.workSessionId.toString(),
            startTime: activeBreakSession.startTime,
            endTime: activeBreakSession.endTime,
            duration: activeBreakSession.duration,
            status: activeBreakSession.status
          } : null);
        } else {
          setBreakSession(null);
        }
      } else {
        setBreakSession(null);
      }
    } catch (err) {
      console.error('Error loading active sessions:', err);
    }
  }, [user]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load active sessions on component mount
  useEffect(() => {
    const initializeServices = async () => {
      if (user) {
        loadActiveSessions();
        // Request notification permission
        notificationService.requestPermission();
        
        // Initialize offline services
        await networkDetectionService.initialize();
        await syncService.initialize();
        await offlineStorageService.initialize();
        
        // Initialize idle management
        await idleManagementService.initialize(user.id);
        
        // Initialize tracking services
            await applicationTrackingService.initialize(user.id);
            await websiteTrackingService.initialize(user.id);
            await attendanceTrackingService.initialize(user.id);
        
        // Initialize screen capture service
        const initialized = await screenCaptureService.initialize();
        if (initialized) {
          // Check if we need to show privacy notification
          const hasDecided = localStorage.getItem('screenCapturePrivacyDecision');
          if (!hasDecided) {
            setShowPrivacyNotification(true);
          }
        }
      }
    };

    initializeServices();
  }, [user, loadActiveSessions]);

  // Get current status
  const getCurrentStatus = () => {
    return TimeTrackingService.getCurrentStatus(workSession, breakSession);
  };

  const currentStatus = getCurrentStatus();

  const handleClockIn = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await TimeTrackingService.clockIn({
        employeeId: user.id,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      await loadActiveSessions();
      notificationService.showClockInSuccess();
      
      // Start screen capture if enabled
      const settings = screenCaptureService.getSettings();
      if (settings.enabled && result.workSessionId) {
        await screenCaptureService.startCapture(user.id, result.workSessionId);
      }
      
      // Start idle management for work session
      if (result.workSessionId) {
        await TimeTrackingService.initializeIdleManagement(user.id, result.workSessionId);
        
        // Start application and website tracking
        await applicationTrackingService.startTracking(result.workSessionId);
        await websiteTrackingService.startTracking(result.workSessionId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  }, [user, notes, loadActiveSessions]);

  const handleClockOut = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.clockOut({
        employeeId: user.id,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      
      // Stop screen capture
      screenCaptureService.stopCapture();
      
      // Stop idle management
      await TimeTrackingService.stopIdleManagement();
      
      // Stop application and website tracking
      applicationTrackingService.stopTracking();
      websiteTrackingService.stopTracking();
      
      await loadActiveSessions();
      notificationService.showClockOutSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  }, [user, notes, loadActiveSessions]);

  const handleStartBreak = useCallback(async () => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start break');
    } finally {
      setLoading(false);
    }
  }, [workSession, notes, loadActiveSessions]);

  const handleEndBreak = useCallback(async () => {
    if (!workSession) return;
    
    setLoading(true);
    setError('');
    
    try {
      await TimeTrackingService.endBreak(workSession.id, notes.trim() || undefined);
      setNotes('');
      await loadActiveSessions();
      notificationService.showBreakEndSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end break');
    } finally {
      setLoading(false);
    }
  }, [workSession, notes, loadActiveSessions]);

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
    return TimeFormat.formatDurationBetweenHHMM(startTime, currentTime);
  };

  const handlePrivacyAccept = () => {
    setShowPrivacyNotification(false);
    // User accepted, screen capture can be enabled
  };

  const handlePrivacyDecline = () => {
    setShowPrivacyNotification(false);
    // User declined, disable screen capture
    screenCaptureService.updateSettings({ enabled: false });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Enter: Clock In/Out
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!workSession) {
          handleClockIn();
        } else if (currentStatus !== 'on_break') {
          handleClockOut();
        }
      }

      // Ctrl/Cmd + B: Start/End Break
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        if (workSession && !breakSession) {
          handleStartBreak();
        } else if (workSession && breakSession) {
          handleEndBreak();
        }
      }

      // Escape: Clear notes
      if (event.key === 'Escape') {
        setNotes('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [workSession, breakSession, currentStatus, notes, handleClockIn, handleClockOut, handleStartBreak, handleEndBreak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavBar />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Hero Section - Current Status & Time */}
        <div className="mb-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              {/* Status Display */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${getStatusColor(currentStatus).replace('text-', 'bg-').replace('border-', 'bg-').replace('100', '500')} bg-opacity-10`}>
                    {currentStatus === 'working' && <Activity className="h-5 w-5 text-green-600" />}
                    {currentStatus === 'on_break' && <Coffee className="h-5 w-5 text-yellow-600" />}
                    {currentStatus === 'offline' && <XCircle className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {getStatusText(currentStatus)}
                    </h1>
                    {workSession && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Since {TimeFormat.formatDisplayTime(workSession.clockInTime)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Live Timer */}
                {workSession && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90">Current Session</p>
                        <p className="text-lg font-mono font-bold">
                          {formatDuration(workSession.clockInTime)}
                        </p>
                      </div>
                      <Timer className="h-5 w-5 opacity-80" />
                    </div>
                  </div>
                )}
              </div>

              {/* Current Time */}
              <div className="text-center lg:text-right w-full lg:w-auto">
                <div className="bg-gray-900 text-white rounded-xl p-3">
                  <div className="text-xl font-mono font-bold">
                    {TimeFormat.formatDisplayTime(currentTime)}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Primary Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
          
              {error && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {!workSession ? (
                  <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <Play className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Clock In</div>
                        <div className="text-xs opacity-90">Start workday</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleClockOut}
                    disabled={loading || currentStatus === 'on_break'}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-3 rounded-xl hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Clock Out</div>
                        <div className="text-xs opacity-90">End workday</div>
                      </div>
                    </div>
                  </button>
                )}

                {workSession && !breakSession ? (
                  <button
                    onClick={handleStartBreak}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-3 rounded-xl hover:from-yellow-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <Coffee className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Start Break</div>
                        <div className="text-xs opacity-90">Take a break</div>
                      </div>
                    </div>
                  </button>
                ) : workSession && breakSession ? (
                  <button
                    onClick={handleEndBreak}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <Pause className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">End Break</div>
                        <div className="text-xs opacity-90">Back to work</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 text-gray-400 px-3 py-3 rounded-xl cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="p-1 bg-gray-200 rounded-lg">
                        <Coffee className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Start Break</div>
                        <div className="text-xs">Clock in first</div>
                      </div>
                    </div>
                  </button>
                )}
          </div>

              {/* Notes Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes (Optional)
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                    <span>to clear</span>
                  </div>
                </div>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                  placeholder="What are you working on?"
                />
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Shortcuts</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs">Ctrl+Enter</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Clock In/Out</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs">Ctrl+B</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Break</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Stats</h3>
              </div>
              
              {workSession ? (
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Time</span>
                      <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDuration(workSession.clockInTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Work Time</span>
                      <Target className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {TimeTrackingService.formatTime(workSession.totalWorkTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Break Time</span>
                      <Coffee className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {TimeTrackingService.formatTime(workSession.totalBreakTime)}
                    </div>
                  </div>
                  
                  {workSession.totalWorkTime > 480 && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overtime</span>
                        <Award className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {TimeTrackingService.formatTime(workSession.totalWorkTime - 480)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit mx-auto mb-2">
                    <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No active session</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Clock in to start</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application and Website Usage */}
          {user && workSession && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ApplicationUsage workSessionId={workSession.id} employeeId={user.id} />
              <WebsiteUsage workSessionId={workSession.id} employeeId={user.id} />
            </div>
          )}

          {/* Attendance Dashboard */}
          {user && (
            <div className="mb-6">
              <AttendanceDashboard employeeId={user.id} />
            </div>
          )}

        {/* Screen Capture & Additional Features */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            {/* Screen Capture */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Camera className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Screen Capture</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowScreenCaptures(!showScreenCaptures)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>{showScreenCaptures ? 'Hide' : 'View'}</span>
                  </button>
                  <button
                    onClick={() => setShowScreenCaptureSettings(!showScreenCaptureSettings)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${screenCaptureService.isActive() ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {screenCaptureService.isActive() ? 'Active' : 'Inactive'}
                </span>
              </div>

            {showScreenCaptureSettings && (
                <div className="mt-6">
              <ScreenCaptureSettingsComponent />
                </div>
            )}

            {showScreenCaptures && (
                <div className="mt-6">
              <ScreenCaptureViewerComponent 
                employeeId={user.id} 
                workSessionId={workSession?.id}
                date={currentDate}
              />
                </div>
              )}
            </div>

            {/* Idle Status */}
            <div>
              <IdleStatusComponent />
            </div>

            {/* Offline Status */}
            <div>
              <OfflineStatusComponent />
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today&apos;s Progress</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Daily Goal</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">8 hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {workSession ? Math.round((workSession.totalWorkTime / 480) * 100) : 0}%
                    </div>
                    <div className="w-12 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${workSession ? Math.min((workSession.totalWorkTime / 480) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Productivity</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {workSession ? Math.round((workSession.totalWorkTime / Math.max(workSession.totalWorkTime + workSession.totalBreakTime, 1)) * 100) : 0}%
                    </p>
                  </div>
                  
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sessions</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {workSession ? '1' : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Summary */}
        {user && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <Calendar className="h-4 w-4 text-cyan-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Summary</h2>
            </div>
            <DailySummaryComponent employeeId={user.id} />
          </div>
        )}
      </div>

      {/* Privacy Notification Modal */}
      {showPrivacyNotification && (
        <PrivacyNotificationComponent
          onAccept={handlePrivacyAccept}
          onDecline={handlePrivacyDecline}
        />
      )}

        {/* Idle Warning Modal */}
        <IdleWarningComponent
          isVisible={idleWarning.isVisible}
          onClose={idleWarning.hideWarning}
          onGoIdle={idleWarning.handleGoIdle}
          onKeepActive={idleWarning.handleKeepActive}
          timeRemaining={idleWarning.timeRemaining}
        />

        {/* Tracking Settings Modal */}
        {user && (
          <TrackingSettings
            employeeId={user.id}
            isOpen={showTrackingSettings}
            onClose={() => setShowTrackingSettings(false)}
          />
        )}
      </div>
    );
  }
