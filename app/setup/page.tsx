'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SetupFormData {
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  includeSeedData: boolean;
  resetExisting: boolean;
}

interface SetupResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [formData, setFormData] = useState<SetupFormData>({
    adminEmail: 'admin@clinic.com',
    adminPassword: 'Admin123!@#',
    adminName: 'System Administrator',
    includeSeedData: true,
    resetExisting: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          action: 'setup'
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Redirect to login page after successful setup
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Setup failed due to network error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to check setup status',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    // First confirmation
    if (!confirm('⚠️ WARNING: This will permanently delete ALL data in the database!\n\nThis includes:\n- All users (admin, doctors, patients, etc.)\n- All appointments\n- All patient records\n- All prescriptions\n- All billing data\n- All lab results\n- All queue entries\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to continue?')) {
      return;
    }

    // Second confirmation with typing requirement
    const confirmationText = 'DELETE ALL DATA';
    const userInput = prompt(`To confirm this destructive action, please type exactly: "${confirmationText}"\n\nThis will permanently delete ALL data in the database.`);
    
    if (userInput !== confirmationText) {
      alert('Reset cancelled. The confirmation text did not match.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Reset failed due to network error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          MediNext Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configure MediNext
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSetup}>
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                Administrator Name
              </label>
              <div className="mt-1">
                <input
                  id="adminName"
                  name="adminName"
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 shadow-sm shadow-gray-200/50 focus:shadow-indigo-200/50 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Administrator Email
              </label>
              <div className="mt-1">
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 shadow-sm shadow-gray-200/50 focus:shadow-indigo-200/50 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Administrator Password
              </label>
              <div className="mt-1">
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 shadow-sm shadow-gray-200/50 focus:shadow-indigo-200/50 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="includeSeedData"
                name="includeSeedData"
                type="checkbox"
                checked={formData.includeSeedData}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded shadow-sm shadow-gray-200/50"
              />
              <label htmlFor="includeSeedData" className="ml-2 block text-sm text-gray-900">
                Include sample data (patients, doctors, appointments)
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="resetExisting"
                name="resetExisting"
                type="checkbox"
                checked={formData.resetExisting}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded shadow-sm shadow-gray-200/50"
              />
              <label htmlFor="resetExisting" className="ml-2 block text-sm text-gray-900">
                Reset existing data (if admin user exists)
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Setup Application'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full shadow-sm shadow-gray-200/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleCheckStatus}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 rounded-md shadow-sm shadow-gray-200/50 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:shadow-gray-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Status
              </button>

              <button
                onClick={handleReset}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 rounded-md shadow-sm shadow-red-200/50 bg-red-600 text-sm font-medium text-white hover:bg-red-700 hover:shadow-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : '⚠️ Reset Database'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              <p className="font-medium">{result.message}</p>
              
              {result.data && (
                <div className="mt-2 text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
