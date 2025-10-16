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
      <div className={`inline-flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded text-xs ${className}`}>
        <span className="font-mono">Role: {currentRole || 'none'}</span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900">Role Debug Information</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Authentication Status:</span>
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Employee Data:</span>
          <div className="flex items-center space-x-1">
            {hasEmployeeData ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={hasEmployeeData ? 'text-green-600' : 'text-red-600'}>
              {hasEmployeeData ? 'Loaded' : 'Missing'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Role:</span>
          <div className="flex items-center space-x-1">
            {currentRole === 'admin' ? (
              <Shield className="h-4 w-4 text-purple-600" />
            ) : currentRole === 'employee' ? (
              <User className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className={
              currentRole === 'admin' ? 'text-purple-600' : 
              currentRole === 'employee' ? 'text-blue-600' : 
              'text-gray-400'
            }>
              {currentRole || 'None'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Is Admin:</span>
          <span className={isAdmin ? 'text-purple-600 font-medium' : 'text-gray-500'}>
            {isAdmin ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Is Employee:</span>
          <span className={isEmployee ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            {isEmployee ? 'Yes' : 'No'}
          </span>
        </div>

        {employee && (
          <>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="text-gray-600 mb-1">Employee Details:</div>
              <div className="text-xs text-gray-500 space-y-1">
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
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="text-gray-600 mb-1">User Details:</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>UID: {user.uid}</div>
                <div>Email: {user.email}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
