'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  Clock, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Activity,
  Briefcase,
  Users,
  Newspaper,
  ShoppingCart,
  GraduationCap,
  Gamepad2
} from 'lucide-react';
import { websiteTrackingService } from '@/lib/websiteTracking';
// Removed direct database import - using API route instead
import { TimeFormat } from '@/lib/timeFormat';

interface WebsiteUsageProps {
  workSessionId: string;
  employeeId: string;
}

interface WebsiteActivityData {
  id: string;
  domain: string;
  url: string;
  pageTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  category?: string;
  productivity?: string;
}

export default function WebsiteUsage({ workSessionId, employeeId }: WebsiteUsageProps) {
  const [activities, setActivities] = useState<WebsiteActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<WebsiteActivityData | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<{
    isTracking: boolean;
    currentActivity: WebsiteActivityData | null;
    settings: {
      enabled: boolean;
      trackWebsites: boolean;
      trackPageTitles: boolean;
      trackFullUrls: boolean;
      samplingInterval: number;
      maxIdleTime: number;
      categoryRules: { [key: string]: string };
      productivityRules: { [key: string]: string };
      privacyMode: boolean;
      blocklist: string[];
      allowlist: string[];
    } | null;
  } | null>(null);

  const loadActivities = useCallback(async () => {
    try {
      // Check if employeeId is valid before making API calls
      if (!employeeId || employeeId === 'undefined') {
        console.warn('WebsiteUsage: employeeId is undefined or invalid:', employeeId);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/website-activities?workSessionId=${workSessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch website activities');
      }
      const result = await response.json();
      const data = result.data;
      setActivities(data.map(activity => ({
        id: activity._id.toString(),
        employeeId: activity.employeeId.toString(),
        workSessionId: activity.workSessionId.toString(),
        domain: activity.domain,
        url: activity.url,
        pageTitle: activity.pageTitle,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        isActive: activity.isActive,
        category: activity.category,
        productivity: activity.productivity
      })));
    } catch (error) {
      console.error('Error loading website activities:', error);
    } finally {
      setLoading(false);
    }
  }, [workSessionId, employeeId]);

  useEffect(() => {
    loadActivities();
    loadTrackingStatus();
  }, [workSessionId, loadActivities]);

  const loadTrackingStatus = () => {
    const status = websiteTrackingService.getTrackingStatus();
    setTrackingStatus(status);
    setCurrentActivity(status.currentActivity);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'work':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'social':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'news':
        return <Newspaper className="h-4 w-4 text-orange-600" />;
      case 'entertainment':
        return <Gamepad2 className="h-4 w-4 text-red-600" />;
      case 'shopping':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      case 'education':
        return <GraduationCap className="h-4 w-4 text-indigo-600" />;
      default:
        return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProductivityIcon = (productivity?: string) => {
    switch (productivity) {
      case 'productive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'distracting':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProductivityColor = (productivity?: string) => {
    switch (productivity) {
      case 'productive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'distracting':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getTotalTimeByProductivity = () => {
    const productivityTotals: { [key: string]: number } = {};
    
    activities.forEach(activity => {
      const productivity = activity.productivity || 'neutral';
      const duration = activity.duration || 0;
      productivityTotals[productivity] = (productivityTotals[productivity] || 0) + duration;
    });

    return Object.entries(productivityTotals)
      .map(([productivity, duration]) => ({ productivity, duration }))
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

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
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
          <div className="icon-container icon-container-info">
            <Globe className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Website Usage</h3>
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
        <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Currently Browsing</span>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryIcon(currentActivity.category)}
            <span className="font-medium text-gray-900 dark:text-white">
              {getDomainFromUrl(currentActivity.domain)}
            </span>
            {currentActivity.pageTitle && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                - {currentActivity.pageTitle}
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Websites</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {activities.length}
          </p>
        </div>
      </div>

      {/* Productivity Overview */}
      {getTotalTimeByProductivity().length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Productivity Overview</h4>
          <div className="space-y-2">
            {getTotalTimeByProductivity().map(({ productivity, duration }) => (
              <div key={productivity} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getProductivityIcon(productivity)}
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {productivity}
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
                      {getDomainFromUrl(activity.domain)}
                    </p>
                    {activity.pageTitle && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {activity.pageTitle}
                      </p>
                    )}
                  </div>
                  {activity.productivity && (
                    <div className={`px-2 py-1 rounded-full text-xs border ${getProductivityColor(activity.productivity)}`}>
                      {activity.productivity}
                    </div>
                  )}
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
          <Globe className="empty-state-icon" />
          <div className="empty-state-title">No Browsing Activity</div>
          <div className="empty-state-description">
            No website activity recorded yet
          </div>
          <div className="empty-state-subtitle">
            Start browsing to see your website usage
          </div>
        </div>
      )}
    </div>
  );
}
