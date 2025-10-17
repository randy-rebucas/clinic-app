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
  Camera
} from 'lucide-react';
import ThemeToggle from '@/components/Theme/ThemeToggle';
import AttendanceReport from './AttendanceReport';
import EmployeeManagement from './EmployeeManagement';
import ScreenCaptureManagement from './ScreenCaptureManagement';
import AttendanceManagement from './AttendanceManagement';

export default function AdminDashboard() {
  const { employee } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
  });

  useEffect(() => {
    // Load dashboard statistics
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // This would fetch real data from the database
    // For now, using mock data
    setStats({
      totalEmployees: 25,
      activeEmployees: 18,
      totalWorkHours: 142.5,
      averageWorkHours: 8.0,
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'screen-captures', label: 'Screen Captures', icon: Camera },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} />;
      case 'employees':
        return <EmployeeManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'screen-captures':
        return <ScreenCaptureManagement />;
      case 'reports':
        return <AttendanceReport />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab stats={stats} />;
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
        {renderTabContent()}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: { totalEmployees: number; activeEmployees: number; totalWorkHours: number; averageWorkHours: number } }) {
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
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.averageWorkHours}</p>
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
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalWorkHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">John Doe clocked in at 9:00 AM</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">2m ago</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Jane Smith started a break at 10:30 AM</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">15m ago</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mike Johnson is 15 minutes late</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">30m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="card p-4">
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">System Settings</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Work Hours per Day
          </label>
          <input
            type="number"
            defaultValue={8}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Break Reminder Interval (minutes)
          </label>
          <input
            type="number"
            defaultValue={30}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overtime Threshold (hours)
          </label>
          <input
            type="number"
            defaultValue={40}
            className="input-field"
          />
        </div>
        <button className="btn-primary px-3 py-2 text-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}
