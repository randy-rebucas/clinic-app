'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeTrackingService } from '@/lib/timeTracking';
import { ClientTimeTrackingService } from '@/lib/clientTimeTracking';
import { WorkSession, BreakSession } from '@/types';

// API response types for batch data
interface ApiWorkSession {
  _id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime?: Date;
  totalBreakTime: number;
  totalWorkTime: number;
  notes?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface ApiBreakSession {
  _id: string;
  workSessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  status: 'active' | 'completed';
}
import NavBar from '@/components/Navigation/NavBar';

// Lazy load DailySummary as it's at the bottom of the page
const DailySummaryComponent = dynamic(() => import('./DailySummary'), {
  loading: () => (
    <div className="card p-3">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
});
import { notificationService } from '@/lib/notifications';
import { TimeFormat } from '@/lib/timeFormat';
import { screenCaptureService } from '@/lib/screenCapture';
import { networkDetectionService } from '@/lib/networkDetection';
import { syncService } from '@/lib/syncService';
import { offlineStorageService } from '@/lib/offlineStorage';
import { idleManagementService } from '@/lib/idleManagement';
import { applicationTrackingService } from '@/lib/applicationTracking';
import { websiteTrackingService } from '@/lib/websiteTracking';
import dynamic from 'next/dynamic';
import { useIdleWarning } from './IdleWarning';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { useDashboardTimer, useSessionTimer } from '@/lib/hooks/useOptimizedTimer';
// Removed caching system for real-time data
// Removed batch API for direct real-time calls

// Lazy load heavy components that are not immediately visible
const ScreenCaptureSettingsComponent = dynamic(() => import('./ScreenCaptureSettings'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
  ssr: false // Uses navigator.mediaDevices API
});

const ScreenCaptureViewerComponent = dynamic(() => import('./ScreenCaptureViewer'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>,
  ssr: false // Uses DOM manipulation APIs
});

const PrivacyNotificationComponent = dynamic(() => import('./PrivacyNotification'), {
  ssr: false // Uses localStorage API
});

const OfflineStatusComponent = dynamic(() => import('./OfflineStatus'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
});

const IdleStatusComponent = dynamic(() => import('./IdleStatus'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
});

const IdleWarningComponent = dynamic(() => import('./IdleWarning'), {
  ssr: false // This component uses browser APIs
});

const ApplicationUsage = dynamic(() => import('./ApplicationUsage'), {
  loading: () => (
    <div className="card p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
});

const WebsiteUsage = dynamic(() => import('./WebsiteUsage'), {
  loading: () => (
    <div className="card p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
});

const TrackingSettings = dynamic(() => import('./TrackingSettings'), {
  ssr: false // This component likely uses browser APIs
});

const Charts = dynamic(() => import('./Charts'), {
  loading: () => (
    <div className="card p-4">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
});

const AdvancedDateUtils = dynamic(() => import('./AdvancedDateUtils'), {
  loading: () => (
    <div className="card p-4">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
});
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
  
  // Debug log to track user object changes
  useEffect(() => {
    console.log('TimeTrackerDashboard - User object changed:', user);
  }, [user]);
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [breakSession, setBreakSession] = useState<BreakSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [showScreenCaptureSettings, setShowScreenCaptureSettings] = useState(false);
  const [showScreenCaptures, setShowScreenCaptures] = useState(false);
  const [showPrivacyNotification, setShowPrivacyNotification] = useState(false);
  const [showTrackingSettings, setShowTrackingSettings] = useState(false);
  const [currentDate] = useState(() => new Date());

  // Idle warning hook
  const idleWarning = useIdleWarning();
  
  // Optimized timers
  const { displayTime: currentTime } = useDashboardTimer();
  const { displayTime: sessionTime } = useSessionTimer(); // eslint-disable-line @typescript-eslint/no-unused-vars

  const loadActiveSessions = useCallback(async () => {
    if (!user || !user.id) {
      console.warn('Cannot load active sessions: user or user.id is missing');
      return;
    }

    try {
      // Make direct API calls for real-time data
      const [workSessionResponse, breakSessionResponse] = await Promise.all([
        fetch(`/api/work-sessions/active?employeeId=${user.id}`),
        fetch(`/api/break-sessions/active?employeeId=${user.id}`)
      ]);

      // Process work session data
      if (workSessionResponse.ok) {
        const workSessionData = await workSessionResponse.json();
        if (workSessionData.data) {
          const activeWorkSession = workSessionData.data as ApiWorkSession;
          // Active work session loaded
          setWorkSession({
            id: activeWorkSession._id.toString(),
            employeeId: activeWorkSession.employeeId.toString(),
            clockInTime: activeWorkSession.clockInTime,
            totalBreakTime: activeWorkSession.totalBreakTime,
            totalWorkTime: activeWorkSession.totalWorkTime,
            status: activeWorkSession.status,
            createdAt: activeWorkSession.createdAt,
            updatedAt: activeWorkSession.updatedAt
          });
        } else {
          setWorkSession(null);
        }
      } else {
        setWorkSession(null);
      }

      // Process break session data
      if (breakSessionResponse.ok) {
        const breakSessionData = await breakSessionResponse.json();
        if (breakSessionData.data) {
          const activeBreakSession = breakSessionData.data as ApiBreakSession;
          // Active break session loaded
          setBreakSession({
            id: activeBreakSession._id.toString(),
            workSessionId: activeBreakSession.workSessionId.toString(),
            startTime: activeBreakSession.startTime,
            endTime: activeBreakSession.endTime,
            duration: activeBreakSession.duration,
            status: activeBreakSession.status
          });
        } else {
          // No active break session
          setBreakSession(null);
        }
      } else {
        setBreakSession(null);
      }
    } catch (err) {
      console.error('Error loading active sessions:', err);
    }
  }, [user]);

  // Timer is now handled by useDashboardTimer hook

  // Load active sessions on component mount
  useEffect(() => {
    const initializeServices = async () => {
      if (user && user.id) {
        try {
          // Load active sessions directly for real-time data
          await loadActiveSessions();
        } catch (err) {
          console.error('Error initializing services:', err);
        }

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

        // Initialize screen capture service
        const initialized = await screenCaptureService.initialize();
        if (initialized) {
          // Check if we need to show privacy notification
          const hasDecided = localStorage.getItem('screenCapturePrivacyDecision');
          if (!hasDecided) {
            setShowPrivacyNotification(true);
          }
        }
      } else if (user && !user.id) {
        console.error('User object exists but missing ID. This indicates an authentication issue.');
        setError('Authentication error: Missing user ID. Please log in again.');
      }
    };

    initializeServices();
  }, [user, loadActiveSessions]);

  // Get current status
  const getCurrentStatus = () => {
    return TimeTrackingService.getCurrentStatus(workSession, breakSession);
  };

  const currentStatus = getCurrentStatus();
  
  // Real-time state tracking (no caching)

  const handleClockIn = useCallback(async () => {
    if (!user || !user.id) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ClientTimeTrackingService.clockIn({
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
    if (!user || !user.id) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ClientTimeTrackingService.clockOut({
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

    // Starting break
    setLoading(true);
    setError('');

    try {
      const result = await ClientTimeTrackingService.startBreak({
        workSessionId: workSession.id,
        notes: notes.trim() || undefined,
      });
      // Break started successfully
      setNotes('');
      await loadActiveSessions();
      notificationService.showBreakStartSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start break';
      // Failed to start break
      setError(errorMessage);
      
      // If the error is about already being on break, refresh the session data
      if (errorMessage.includes('already on break')) {
        // Break already active, refreshing session data
        await loadActiveSessions();
      }
    } finally {
      setLoading(false);
    }
  }, [workSession, notes, loadActiveSessions]);

  const handleEndBreak = useCallback(async () => {
    if (!workSession) return;

    setLoading(true);
    setError('');

    try {
      await ClientTimeTrackingService.endBreak(workSession.id, notes.trim() || undefined);
      setNotes('');
      await loadActiveSessions();
      notificationService.showBreakEndSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end break');
    } finally {
      setLoading(false);
    }
  }, [workSession, notes, loadActiveSessions]);


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
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <NavBar />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Hero Section - Current Status & Time */}
        <div className="mb-6">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Status Display */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${currentStatus === 'working' ? 'bg-green-100 dark:bg-green-900/30' :
                      currentStatus === 'on_break' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                    }`}>
                    {currentStatus === 'working' && <Activity className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />}
                    {currentStatus === 'on_break' && <Coffee className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
                    {currentStatus === 'offline' && <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {getStatusText(currentStatus)}
                    </h1>
                    {workSession && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Since {TimeFormat.formatDisplayTime(workSession.clockInTime)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Timer */}
                {workSession && (
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90 mb-1">Current Session</p>
                        <p className="text-2xl font-mono font-bold">
                          {formatDuration(workSession.clockInTime)}
                        </p>
                      </div>
                      <Timer className="h-6 w-6 opacity-80" />
                    </div>
                  </div>
                )}
              </div>

              {/* Current Time */}
              <div className="text-center lg:text-right w-full lg:w-auto">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-mono font-bold">
                    {TimeFormat.formatDisplayTime(currentTime)}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
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
            <div className="card p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="icon-container icon-container-primary">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {!workSession ? (
                  <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="btn-success px-4 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Play className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold">Clock In</div>
                        <div className="text-xs opacity-90">Start your workday</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleClockOut}
                    disabled={loading || currentStatus === 'on_break'}
                    className="btn-danger px-4 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold">Clock Out</div>
                        <div className="text-xs opacity-90">End your workday</div>
                      </div>
                    </div>
                  </button>
                )}

                {workSession && !breakSession ? (
                  <button
                    onClick={handleStartBreak}
                    disabled={loading}
                    className="btn-warning px-4 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Coffee className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold">Start Break</div>
                        <div className="text-xs opacity-90">Take a well-deserved break</div>
                      </div>
                    </div>
                  </button>
                ) : workSession && breakSession ? (
                  <button
                    onClick={handleEndBreak}
                    disabled={loading}
                    className="btn-primary px-4 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Pause className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold">End Break</div>
                        <div className="text-xs opacity-90">Back to productive work</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-4 py-4 rounded-xl cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xl">
                        <Coffee className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold">Start Break</div>
                        <div className="text-xs">Clock in first</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes (Optional)
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono">Esc</kbd>
                    <span>to clear</span>
                  </div>
                </div>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="What are you working on? Add any notes about your current task..."
                />
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Keyboard Shortcuts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md text-xs font-mono text-blue-800 dark:text-blue-300">Ctrl+Enter</kbd>
                    <span className="text-blue-700 dark:text-blue-400">Clock In/Out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md text-xs font-mono text-blue-800 dark:text-blue-300">Ctrl+B</kbd>
                    <span className="text-blue-700 dark:text-blue-400">Start/End Break</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="lg:col-span-1">
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="icon-container icon-container-purple">
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
                <div className="empty-state py-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit mx-auto mb-2">
                    <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="empty-state-title text-sm">No Active Session</div>
                  <div className="empty-state-subtitle">Clock in to start</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application and Website Usage - Only load when work session is active */}
        {user && workSession && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ErrorBoundary level="component">
              <ApplicationUsage workSessionId={workSession.id} employeeId={user.id} />
            </ErrorBoundary>
            <ErrorBoundary level="component">
              <WebsiteUsage workSessionId={workSession.id} employeeId={user.id} />
            </ErrorBoundary>
          </div>
        )}


        {/* Screen Capture & Additional Features */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            {/* Screen Capture */}
            <div className="card p-3">
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
                  <ErrorBoundary level="component">
                    <ScreenCaptureSettingsComponent />
                  </ErrorBoundary>
                </div>
              )}

              {showScreenCaptures && (
                <div className="mt-6">
                  <ErrorBoundary level="component">
                    <ScreenCaptureViewerComponent
                      employeeId={user.id}
                      workSessionId={workSession?.id}
                      date={currentDate}
                    />
                  </ErrorBoundary>
                </div>
              )}
            </div>

            {/* Idle Status */}
            <div>
              <ErrorBoundary level="component">
                <IdleStatusComponent />
              </ErrorBoundary>
            </div>

            {/* Offline Status */}
            <div>
              <ErrorBoundary level="component">
                <OfflineStatusComponent />
              </ErrorBoundary>
            </div>

            {/* Quick Stats */}
            <div className="card p-3">
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

        {/* Charts - Only load when user wants to see analytics */}
        {user && workSession && (
          <ErrorBoundary level="section">
            <Charts workSessionId={workSession.id} employeeId={user.id} />
          </ErrorBoundary>
        )}

        {/* Advanced Date Utils - Demonstrates lazy loading of external libraries */}
        {user && (
          <ErrorBoundary level="section">
            <AdvancedDateUtils date={currentDate} />
          </ErrorBoundary>
        )}

        {/* Daily Summary */}
        {user && (
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <Calendar className="h-4 w-4 text-cyan-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Summary</h2>
            </div>
            <ErrorBoundary level="component">
              <DailySummaryComponent employeeId={user.id} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Privacy Notification Modal */}
      {showPrivacyNotification && (
        <ErrorBoundary level="component">
          <PrivacyNotificationComponent
            onAccept={handlePrivacyAccept}
            onDecline={handlePrivacyDecline}
          />
        </ErrorBoundary>
      )}

      {/* Idle Warning Modal */}
      <ErrorBoundary level="component">
        <IdleWarningComponent
          isVisible={idleWarning.isVisible}
          onClose={idleWarning.hideWarning}
          onGoIdle={idleWarning.handleGoIdle}
          onKeepActive={idleWarning.handleKeepActive}
          timeRemaining={idleWarning.timeRemaining}
        />
      </ErrorBoundary>

      {/* Tracking Settings Modal */}
      {user && (
        <ErrorBoundary level="component">
          <TrackingSettings
            employeeId={user.id}
            isOpen={showTrackingSettings}
            onClose={() => setShowTrackingSettings(false)}
          />
        </ErrorBoundary>
      )}
      </div>
    </ErrorBoundary>
  );
}
