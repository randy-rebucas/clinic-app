'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Employee } from '@/types';

interface LocalUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: LocalUser | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, employeeData: Omit<Employee, 'id' | 'email' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
  hasRole: (role: 'admin' | 'employee') => boolean;
  getCurrentRole: () => 'admin' | 'employee' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const checkStoredAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Fetch employee data from API
          const response = await fetch(`/api/auth/employee?id=${userData.id}`);
          if (response.ok) {
            const data = await response.json();
            setEmployee(data.employee);
          }
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Simple authentication - find employee by email
      // In a real app, you'd hash the password and verify it
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const employeeData = data.employee;
      
      // Accept any password (implement proper password verification in production)
      // In production, you'd verify the password hash
      const userData = { id: employeeData.id, email: employeeData.email };
      setUser(userData);
      setEmployee(employeeData);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    employeeData: Omit<Employee, 'id' | 'email' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      // Generate a simple ID (in production, use a proper UUID generator)
      const id = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newEmployeeData = {
        name: employeeData.name,
        email,
        password,
        role: employeeData.role,
        department: employeeData.department,
        position: employeeData.position,
      };
      
      const response = await fetch('/api/auth/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployeeData),
      });

      if (!response.ok) {
        let errorMessage = 'Sign up failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const employeeId = data.employeeId;
      
      // Auto-login after signup
      const userData = { id: employeeId, email };
      setUser(userData);
      
      // Create a mock Employee object for the state
      const mockEmployee: Employee = {
        id: employeeId,
        name: employeeData.name,
        email,
        role: employeeData.role,
        department: employeeData.department,
        position: employeeData.position,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setEmployee(mockEmployee);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setEmployee(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Role checking utilities
  const isAdmin = employee?.role === 'admin';
  const isEmployee = employee?.role === 'employee';
  
  const hasRole = (role: 'admin' | 'employee'): boolean => {
    return employee?.role === role;
  };
  
  const getCurrentRole = (): 'admin' | 'employee' | null => {
    return employee?.role || null;
  };

  const value: AuthContextType = {
    user,
    employee,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin,
    isEmployee,
    hasRole,
    getCurrentRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
