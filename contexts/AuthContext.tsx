'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getEmployee, createEmployee } from '@/lib/database';
import { Employee } from '@/types';
import { isDemoMode, createDemoEmployee, createDemoAdmin } from '@/lib/demoMode';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, employeeData: Omit<Employee, 'id' | 'email' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      // Demo mode - simulate authentication
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const employeeData = await getEmployee(user.uid);
          setEmployee(employeeData);
        } catch (error) {
          console.error('Error fetching employee data:', error);
          setEmployee(null);
        }
      } else {
        setEmployee(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode()) {
      // Demo mode - simulate login
      if (email === 'demo@localpro.com' && password === 'demo123') {
        const demoUser = { uid: 'demo-employee-1', email } as User;
        setUser(demoUser);
        setEmployee(createDemoEmployee());
        return;
      } else if (email === 'admin@localpro.com' && password === 'admin123') {
        const demoUser = { uid: 'demo-admin-1', email } as User;
        setUser(demoUser);
        setEmployee(createDemoAdmin());
        return;
      } else {
        throw new Error('Invalid credentials. Use demo@localpro.com/demo123 or admin@localpro.com/admin123');
      }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newEmployee = {
        ...employeeData,
        email,
        id: userCredential.user.uid,
      };
      
      await createEmployee(newEmployee);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (isDemoMode()) {
      setUser(null);
      setEmployee(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    employee,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin: employee?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
