'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck } from '@/components/Auth/RoleChecker';
import { Clock, Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function NavBar() {
  const { user, employee, logout, isAdmin } = useAuth();
  const { currentRole } = useRoleCheck();

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">LocalPro Time Tracker</h1>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
            >
              Dashboard
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md flex items-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
            
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{employee?.name}</div>
                  <div className="text-xs text-gray-500">
                    {currentRole === 'admin' ? 'Administrator' : 'Employee'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
