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

// API helper functions
const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    // Handle rate limiting specifically
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retrySeconds = retryAfter ? parseInt(retryAfter) : 900; // Default to 15 minutes
      const retryMinutes = Math.ceil(retrySeconds / 60);
      
      throw new Error(`Too many login attempts. Please wait ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''} before trying again.`);
    }
    
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const getEmployee = async (id: string): Promise<Employee | null> => {
  try {
    return await apiCall(`/api/auth/employee?id=${encodeURIComponent(id)}`);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
};

const getEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  try {
    return await apiCall(`/api/auth/employee?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    return null;
  }
};

const loginEmployee = async (email: string, password: string): Promise<Employee | null> => {
  try {
    return await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const response = await apiCall('/api/auth/employee', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
  return response.id;
};

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
          
          // Validate that we have a valid user ID
          if (!userData.id || !userData.email) {
            console.warn('Invalid stored user data, clearing localStorage');
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
          
          setUser(userData);
          console.log('Restored user from localStorage:', userData);
          
          // Fetch employee data from API
          const response = await fetch(`/api/auth/employee?id=${userData.id}`);
          if (response.ok) {
            const data = await response.json();
            setEmployee(data);
            console.log('Fetched employee data:', data);
          } else {
            console.warn('Failed to fetch employee data, clearing stored auth');
            localStorage.removeItem('user');
            setUser(null);
            setEmployee(null);
          }
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('user');
        setUser(null);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Use proper password verification
      const employeeData = await loginEmployee(email, password);
      if (!employeeData) {
        throw new Error('Invalid email or password');
      }
      
      // Ensure we have a valid ID
      if (!employeeData.id) {
        throw new Error('Invalid employee data received');
      }
      
      const userData = { id: employeeData.id, email: employeeData.email };
      setUser(userData);
      setEmployee(employeeData);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('User signed in successfully:', { id: userData.id, email: userData.email });
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
      const newEmployeeData = {
        name: employeeData.name,
        email,
        password,
        role: employeeData.role,
        department: employeeData.department,
        position: employeeData.position,
      };
      
      const employeeId = await createEmployee(newEmployeeData);
      
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
