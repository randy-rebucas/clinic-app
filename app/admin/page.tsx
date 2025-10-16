'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import NavBar from '@/components/Navigation/NavBar';
import { Clock, XCircle, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-lg font-medium text-gray-900">Loading...</div>
          <div className="text-sm text-gray-500">Please wait while we load the admin panel</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-900">Access Denied</div>
          <div className="text-sm text-gray-500">Please log in to access the admin panel</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-900">Access Denied</div>
          <div className="text-sm text-gray-500">You don&apos;t have admin privileges to access this page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <AdminDashboard />
    </div>
  );
}
