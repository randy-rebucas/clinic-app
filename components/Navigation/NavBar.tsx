'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck } from '@/components/Auth/RoleChecker';
import { Clock, Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/Theme/ThemeToggle';

export default function NavBar() {
  const { user, employee, logout, isAdmin } = useAuth();
  const { currentRole } = useRoleCheck();

  if (!user) return null;

  return (
    <header className="glass-effect shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">LocalPro Time Tracker</h1>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors"
            >
              Dashboard
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md flex items-center transition-colors"
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
            
            <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
              <ThemeToggle />
              
              <Link
              href="/profile"
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-medium">{employee?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {currentRole === 'admin' ? 'Administrator' : 'Employee'}
                </div>
              </div>
            </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
