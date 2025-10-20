'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface PatientAuthContextType {
  patient: Patient | null;
  loading: boolean;
  signIn: (patientId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};

export const PatientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored patient authentication
    const checkStoredAuth = async () => {
      try {
        const storedPatient = localStorage.getItem('patient');
        if (storedPatient) {
          const patientData = JSON.parse(storedPatient);
          
          if (!patientData.id || !patientData.patientId) {
            console.warn('Invalid stored patient data, clearing localStorage');
            localStorage.removeItem('patient');
            setLoading(false);
            return;
          }
          
          setPatient(patientData);
          console.log('Restored patient from localStorage:', patientData);
        }
      } catch (error) {
        console.error('Error checking stored patient auth:', error);
        localStorage.removeItem('patient');
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const signIn = async (patientId: string, password: string) => {
    try {
      const response = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.patient) {
        throw new Error('Invalid response from server');
      }
      
      setPatient(data.patient);
      localStorage.setItem('patient', JSON.stringify(data.patient));
      
      console.log('Patient signed in successfully:', data.patient);
    } catch (error) {
      console.error('Patient sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setPatient(null);
      localStorage.removeItem('patient');
    } catch (error) {
      console.error('Patient logout error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!patient;

  const value: PatientAuthContextType = {
    patient,
    loading,
    signIn,
    logout,
    isAuthenticated,
  };

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
};
