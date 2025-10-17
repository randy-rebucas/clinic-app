'use client';

import React from 'react';
import { useRoleCheck } from './RoleChecker';
import { Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

interface RoleDebuggerProps {
  showDetails?: boolean;
  className?: string;
}

export default function RoleDebugger({ showDetails = true, className = '' }: RoleDebuggerProps) {
  const { 
    isAdmin, 
    isEmployee, 
    currentRole, 
    isAuthenticated, 
    hasEmployeeData, 
    user, 
    employee 
  } = useRoleCheck();

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs ${className}`}>
        <span className="font-mono text-gray-900 dark:text-white">Role: {currentRole || 'none'}</span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white">Role Debug Information</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Authentication Status:</span>
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className={isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Employee Data:</span>
          <div className="flex items-center space-x-1">
            {hasEmployeeData ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className={hasEmployeeData ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {hasEmployeeData ? 'Loaded' : 'Missing'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Current Role:</span>
          <div className="flex items-center space-x-1">
            {currentRole === 'admin' ? (
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            ) : currentRole === 'employee' ? (
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={
              currentRole === 'admin' ? 'text-purple-600 dark:text-purple-400' : 
              currentRole === 'employee' ? 'text-blue-600 dark:text-blue-400' : 
              'text-gray-400 dark:text-gray-500'
            }>
              {currentRole || 'None'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Is Admin:</span>
          <span className={isAdmin ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
            {isAdmin ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Is Employee:</span>
          <span className={isEmployee ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
            {isEmployee ? 'Yes' : 'No'}
          </span>
        </div>

        {employee && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Employee Details:</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>Name: {employee.name}</div>
                <div>Email: {employee.email}</div>
                <div>Department: {employee.department || 'N/A'}</div>
                <div>Position: {employee.position || 'N/A'}</div>
              </div>
            </div>
          </>
        )}

        {user && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="text-gray-600 dark:text-gray-400 mb-1">User Details:</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>ID: {user.id}</div>
                <div>Email: {user.email}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
