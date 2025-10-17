'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  Clock, 
  Settings, 
  BarChart3,
  Activity,
  Code,
  Palette,
  MessageSquare,
  Globe,
  Gamepad2,
  FileText
} from 'lucide-react';
import { applicationTrackingService } from '@/lib/applicationTracking';
import { getApplicationActivities } from '@/lib/database';
import { TimeFormat } from '@/lib/timeFormat';

interface ApplicationUsageProps {
  workSessionId: string;
  employeeId: string;
}

interface ApplicationActivity {
  id: string;
  applicationName: string;
  windowTitle: string;
  processName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  category?: string;
}

export default function ApplicationUsage({ workSessionId, employeeId }: ApplicationUsageProps) {
  const [activities, setActivities] = useState<ApplicationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ApplicationActivity | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<{
    isTracking: boolean;
    currentActivity: ApplicationActivity | null;
    settings: {
      enabled: boolean;
      trackApplications: boolean;
      trackWebsites: boolean;
      trackWindowTitles: boolean;
      samplingInterval: number;
      maxIdleTime: number;
      categoryRules: { [key: string]: string };
      privacyMode: boolean;
    } | null;
  } | null>(null);

  const loadActivities = useCallback(async () => {
    try {
      // Check if employeeId is valid before making API calls
      if (!employeeId || employeeId === 'undefined') {
        console.warn('ApplicationUsage: employeeId is undefined or invalid:', employeeId);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getApplicationActivities(workSessionId);
      setActivities(data.map(activity => ({
        id: activity._id.toString(),
        employeeId: activity.employeeId.toString(),
        workSessionId: activity.workSessionId.toString(),
        applicationName: activity.applicationName,
        windowTitle: activity.windowTitle,
        processName: activity.processName,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        isActive: activity.isActive,
        category: activity.category
      })));
    } catch (error) {
      console.error('Error loading application activities:', error);
    } finally {
      setLoading(false);
    }
  }, [workSessionId, employeeId]);

  useEffect(() => {
    loadActivities();
    loadTrackingStatus();
  }, [workSessionId, loadActivities]);

  const loadTrackingStatus = () => {
    const status = applicationTrackingService.getTrackingStatus();
    setTrackingStatus(status);
    setCurrentActivity(status.currentActivity);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'development':
        return <Code className="h-4 w-4 text-blue-600" />;
      case 'design':
        return <Palette className="h-4 w-4 text-purple-600" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'browsing':
        return <Globe className="h-4 w-4 text-indigo-600" />;
      case 'entertainment':
        return <Gamepad2 className="h-4 w-4 text-red-600" />;
      case 'productivity':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-600" />;
    }
  };


  const getTotalTimeByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    activities.forEach(activity => {
      const category = activity.category || 'other';
      const duration = activity.duration || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + duration;
    });

    return Object.entries(categoryTotals)
      .map(([category, duration]) => ({ category, duration }))
      .sort((a, b) => b.duration - a.duration);
  };

  const getTotalTime = () => {
    return activities.reduce((total, activity) => total + (activity.duration || 0), 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="card p-4">
        <div className="loading-header h-4 w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="loading-line h-3"></div>
          <div className="loading-line-short h-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-primary">
            <Monitor className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Application Usage</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${trackingStatus?.isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Current Activity */}
      {currentActivity && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Currently Active</span>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryIcon(currentActivity.category)}
            <span className="font-medium text-gray-900 dark:text-white">
              {currentActivity.applicationName}
            </span>
            {currentActivity.windowTitle && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                - {currentActivity.windowTitle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Time</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatDuration(getTotalTime())}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Applications</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {activities.length}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {getTotalTimeByCategory().length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time by Category</h4>
          <div className="space-y-2">
            {getTotalTimeByCategory().slice(0, 5).map(({ category, duration }) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {category}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDuration(duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Activities</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getCategoryIcon(activity.category)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.applicationName}
                    </p>
                    {activity.windowTitle && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {activity.windowTitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDuration(activity.duration || 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {TimeFormat.formatDisplayTime(activity.startTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="empty-state py-6">
          <Monitor className="empty-state-icon" />
          <div className="empty-state-title">No Activity Yet</div>
          <div className="empty-state-description">
            No application activity recorded yet
          </div>
          <div className="empty-state-subtitle">
            Start working to see your application usage
          </div>
        </div>
      )}
    </div>
  );
}
