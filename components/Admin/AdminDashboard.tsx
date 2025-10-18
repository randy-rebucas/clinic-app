'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  TrendingUp, 
  Download, 
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  LogOut
} from 'lucide-react';
import ThemeToggle from '@/components/Theme/ThemeToggle';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';

// Lazy load admin components that are only shown when their tabs are active
const EmployeeManagement = dynamic(() => import('./EmployeeManagement'), {
  loading: () => (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
});

const ScreenCaptureManagement = dynamic(() => import('./ScreenCaptureManagement'), {
  loading: () => (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

const ReportsDashboard = dynamic(() => import('./ReportsDashboard'), {
  loading: () => (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

const AdminSettings = dynamic(() => import('./AdminSettings'), {
  loading: () => (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
});

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalWorkHours: number;
  averageWorkHours: number;
  totalTimeEntries: number;
  lastUpdated: string;
}

interface RecentActivity {
  id: string;
  type: string;
  employeeName: string;
  employeeId: string;
  timestamp: string;
  description: string;
  icon: string;
  color: string;
}

export default function AdminDashboard() {
  const { employee, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
    totalTimeEntries: 0,
    lastUpdated: '',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load dashboard statistics and recent activity
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and recent activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-activity?limit=10')
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      if (!activityResponse.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const [statsData, activityData] = await Promise.all([
        statsResponse.json(),
        activityResponse.json()
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (activityData.success) {
        setRecentActivity(activityData.data);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Fallback to empty data on error
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        totalWorkHours: 0,
        averageWorkHours: 0,
        totalTimeEntries: 0,
        lastUpdated: new Date().toISOString(),
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'screen-captures', label: 'Screen Captures', icon: Camera },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            stats={stats} 
            recentActivity={recentActivity}
            loading={loading}
            error={error}
            onRefresh={loadDashboardData}
          />
        );
      case 'employees':
        return <EmployeeManagement />;
      case 'screen-captures':
        return <ScreenCaptureManagement />;
      case 'reports':
        return <ReportsDashboard />;
      case 'settings':
        return <AdminSettings />;
      default:
        return (
          <OverviewTab 
            stats={stats} 
            recentActivity={recentActivity}
            loading={loading}
            error={error}
            onRefresh={loadDashboardData}
          />
        );
    }
  };

  if (employee?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <header className="glass-effect shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {employee?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Tab Navigation */}
        <div className="card mb-4">
          <nav className="flex space-x-6 px-4" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <ErrorBoundary level="section">
          {renderTabContent()}
        </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}

interface OverviewTabProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function OverviewTab({ stats, recentActivity, loading, error, onRefresh }: OverviewTabProps) {
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle className="h-4 w-4" />;
      case 'XCircle':
        return <XCircle className="h-4 w-4" />;
      case 'Clock':
        return <Clock className="h-4 w-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="ml-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for recent activity */}
        <div className="card p-4">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="btn-primary px-4 py-2 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="icon-container icon-container-primary">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="icon-container icon-container-success">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Today</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="icon-container icon-container-warning">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average Hours</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.averageWorkHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="icon-container icon-container-purple">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Hours Today</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalWorkHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          <button
            onClick={onRefresh}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={activity.color}>
                    {getActivityIcon(activity.icon)}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {stats.lastUpdated && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

