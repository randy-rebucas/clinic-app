'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle } from 'lucide-react';

interface InstallationStatus {
  needsInstallation: boolean;
  hasUsers: boolean;
  userCount: number;
  isSetup: boolean;
  hasAdmin: boolean;
  hasSettings: boolean;
}

interface InstallationCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function InstallationCheck({ children, fallback }: InstallationCheckProps) {
  const router = useRouter();
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus | null>(null);
  const [checkingInstallation, setCheckingInstallation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInstallationStatus = async () => {
      try {
        const response = await fetch('/api/setup');
        if (response.ok) {
          const data = await response.json();
          setInstallationStatus(data.data);
          
          // If no users exist, redirect to installation
          if (data.data.needsInstallation) {
            router.push('/install');
            return;
          }
        } else {
          setError('Failed to check installation status');
        }
      } catch (error) {
        console.error('Error checking installation status:', error);
        setError('Network error while checking installation status');
      } finally {
        setCheckingInstallation(false);
      }
    };

    checkInstallationStatus();
  }, [router]);

  if (checkingInstallation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-600 font-medium">Checking system status...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (installationStatus?.needsInstallation) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 text-blue-600 animate-spin" />
          <div className="text-gray-600 font-medium">Redirecting to installation...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
