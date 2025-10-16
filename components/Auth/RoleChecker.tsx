'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';

interface RoleCheckerProps {
  showDetails?: boolean;
  className?: string;
}

export default function RoleChecker({ showDetails = false, className = '' }: RoleCheckerProps) {
  const { user, employee, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Checking role...</span>
      </div>
    );
  }

  if (!user || !employee) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Not authenticated</span>
      </div>
    );
  }

  const roleIcon = isAdmin ? Shield : UserCheck;
  const roleColor = isAdmin ? 'text-purple-600' : 'text-blue-600';
  const roleBgColor = isAdmin ? 'bg-purple-100' : 'bg-blue-100';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${roleBgColor}`}>
        {React.createElement(roleIcon, { className: `h-4 w-4 ${roleColor}` })}
        <span className={`text-sm font-medium ${roleColor}`}>
          {isAdmin ? 'Admin' : 'Employee'}
        </span>
      </div>
      
      {showDetails && (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{employee.name}</div>
          <div className="text-xs text-gray-500">
            {employee.department} • {employee.position}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for easy role checking in components
export const useRoleCheck = () => {
  const { isAdmin, isEmployee, hasRole, getCurrentRole, employee, user } = useAuth();
  
  return {
    isAdmin,
    isEmployee,
    hasRole,
    getCurrentRole,
    currentRole: getCurrentRole(),
    isAuthenticated: !!user,
    hasEmployeeData: !!employee,
    user,
    employee,
  };
};
