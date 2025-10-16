'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck } from '@/components/Auth/RoleChecker';
import RoleDebugger from '@/components/Auth/RoleDebugger';
import NavBar from '@/components/Navigation/NavBar';
import { Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function RoleTestPage() {
  const { user, employee, loading } = useAuth();
  const { 
    isAdmin, 
    isEmployee, 
    currentRole, 
    isAuthenticated, 
    hasEmployeeData 
  } = useRoleCheck();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Testing Page</h1>
          <p className="text-gray-600">This page demonstrates the role checking functionality.</p>
        </div>

        {/* Quick Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </div>
                <div className="text-sm text-gray-500">
                  {user ? `User: ${user.email}` : 'No user logged in'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              {hasEmployeeData ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {hasEmployeeData ? 'Employee Data' : 'No Employee Data'}
                </div>
                <div className="text-sm text-gray-500">
                  {employee ? `${employee.name}` : 'Employee data missing'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3">
              {currentRole === 'admin' ? (
                <Shield className="h-8 w-8 text-purple-600" />
              ) : currentRole === 'employee' ? (
                <User className="h-8 w-8 text-blue-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : 'No Role'}
                </div>
                <div className="text-sm text-gray-500">
                  {isAdmin ? 'Administrator' : isEmployee ? 'Regular Employee' : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Access Test */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Access Test</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Employee Dashboard Access</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isEmployee || isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isEmployee || isAdmin ? 'Allowed' : 'Denied'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Admin Dashboard Access</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAdmin ? 'Allowed' : 'Denied'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Time Tracking Access</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAuthenticated ? 'Allowed' : 'Denied'}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Debug Information */}
        <RoleDebugger showDetails={true} />
      </div>
    </div>
  );
}
