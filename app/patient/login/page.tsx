'use client';

import React, { useState, useEffect } from 'react';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Heart } from 'lucide-react';

export default function PatientLoginPage() {
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientIdError, setPatientIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, isAuthenticated } = usePatientAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/patient/dashboard');
    }
  }, [isAuthenticated, router]);

  // Patient ID validation
  const validatePatientId = (id: string) => {
    const patientIdRegex = /^PAT-\d{4}-[A-Z0-9]{9}$/;
    return patientIdRegex.test(id);
  };

  // Real-time validation
  useEffect(() => {
    if (patientId && !validatePatientId(patientId)) {
      setPatientIdError('Please enter a valid patient ID (e.g., PAT-2024-ABC123DEF)');
    } else {
      setPatientIdError('');
    }
  }, [patientId]);

  useEffect(() => {
    if (password && password.length < 3) {
      setPasswordError('Password must be at least 3 characters');
    } else {
      setPasswordError('');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form before submission
    if (!validatePatientId(patientId)) {
      setPatientIdError('Please enter a valid patient ID');
      setLoading(false);
      return;
    }

    if (password.length < 3) {
      setPasswordError('Password must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      await signIn(patientId, password);
      router.push('/patient/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = validatePatientId(patientId) && password.length >= 3 && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Patient Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your medical records and appointments
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                Patient ID
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-4 w-4 ${patientIdError ? 'text-red-400' : patientId && !patientIdError ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="patientId"
                  name="patientId"
                  type="text"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientIdError ? 'border-red-300' : patientId && !patientIdError ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="PAT-2024-ABC123DEF"
                />
                {patientId && !patientIdError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {patientIdError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {patientIdError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 ${passwordError ? 'text-red-400' : password && !passwordError ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    passwordError ? 'border-red-300' : password && !passwordError ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Patient Portal'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have a patient ID? Contact the clinic to register.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> Use your Patient ID as both username and password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
