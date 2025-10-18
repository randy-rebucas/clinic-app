'use client';

import { useAuth } from '@/contexts/AuthContext';
import EmployeeProfile from '@/components/Employee/EmployeeProfile';
import NavBar from '@/components/Navigation/NavBar';
import { Clock, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-lg font-medium text-gray-900 dark:text-white">Loading...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Please wait while we load your profile</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-900 dark:text-white">Access Denied</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Please log in to access your profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <EmployeeProfile />
    </div>
  );
}
