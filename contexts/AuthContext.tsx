'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '@/types';

interface LocalUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: LocalUser | null;
  employee: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, employeeData: Omit<AppUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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

const getUser = async (id: string): Promise<AppUser | null> => {
  try {
    return await apiCall(`/api/auth/employee?id=${encodeURIComponent(id)}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

const getUserByEmail = async (email: string): Promise<AppUser | null> => {
  try {
    return await apiCall(`/api/auth/employee?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

const loginUser = async (email: string, password: string): Promise<AppUser | null> => {
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

const createUser = async (userData: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const response = await apiCall('/api/auth/employee', {
    method: 'POST',
    body: JSON.stringify(userData),
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
  const [employee, setEmployee] = useState<AppUser | null>(null);
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
          
          // Fetch user data from API
          const response = await fetch(`/api/auth/employee?id=${userData.id}`);
          if (response.ok) {
            const data = await response.json();
            setEmployee(data);
            console.log('Fetched user data:', data);
          } else {
            console.warn('Failed to fetch user data, clearing stored auth');
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
      const userData = await loginUser(email, password);
      if (!userData) {
        throw new Error('Invalid email or password');
      }
      
      // Ensure we have a valid ID
      if (!userData.id) {
        throw new Error('Invalid user data received');
      }
      
      const localUserData = { id: userData.id, email: userData.email };
      setUser(localUserData);
      setEmployee(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(localUserData));
      
      console.log('User signed in successfully:', { id: localUserData.id, email: localUserData.email });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string, 
    userData: Omit<AppUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newUserData = {
        name: userData.name,
        email,
        password,
        role: userData.role,
        department: userData.department,
        position: userData.position,
      };
      
      const userId = await createUser(newUserData);
      
      // Auto-login after signup
      const localUserData = { id: userId, email };
      setUser(localUserData);
      
      // Create a mock User object for the state
      const mockUser: AppUser = {
        id: userId,
        name: userData.name,
        email,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setEmployee(mockUser);
      localStorage.setItem('user', JSON.stringify(localUserData));
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
