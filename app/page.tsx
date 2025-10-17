'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import TimeTrackerDashboard from '@/components/TimeTracker/TimeTrackerDashboard';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import { Clock } from 'lucide-react';

export default function Home() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="empty-state">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="empty-state-title">Loading Dashboard</div>
            <div className="empty-state-description">Please wait while we load your dashboard</div>
            <div className="flex justify-center">
              <div className="spinner spinner-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Show admin dashboard for admin users, time tracker for regular employees
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <TimeTrackerDashboard />;
}
