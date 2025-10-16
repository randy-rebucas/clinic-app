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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-lg font-medium text-gray-900">Loading...</div>
          <div className="text-sm text-gray-500">Please wait while we load your dashboard</div>
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
