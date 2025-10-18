'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReportsDashboard from '@/components/Admin/ReportsDashboard';
import { XCircle } from 'lucide-react';

export default function ReportsPage() {
  const { employee } = useAuth();

  if (employee?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access the reports section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportsDashboard />
      </div>
    </div>
  );
}
