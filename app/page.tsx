'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Activity, 
  Stethoscope,
  UserCheck,
  ClipboardList,
  TestTube,
  Bell,
  Loader
} from 'lucide-react';

interface InstallationStatus {
  needsInstallation: boolean;
  hasUsers: boolean;
  userCount: number;
  isSetup: boolean;
  hasAdmin: boolean;
  hasSettings: boolean;
}

export default function Home() {
  const { user, employee, loading, logout } = useAuth();
  const router = useRouter();
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus | null>(null);
  const [checkingInstallation, setCheckingInstallation] = useState(true);

  // Check installation status
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
        }
      } catch (error) {
        console.error('Error checking installation status:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-600 font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
                <Stethoscope className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MediNext
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Access your clinic portal or patient portal
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Staff Portal
              </h2>
              <LoginForm />
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Patient Portal
              </h2>
              <div className="space-y-4">
                <Link
                  href="/patient/login"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center block font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Patient Login
                </Link>
                <Link
                  href="/patient/register"
                  className="w-full bg-white/60 text-gray-700 py-3 px-6 rounded-xl hover:bg-white/80 transition-all duration-200 text-center block font-medium border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
                >
                  New Patient Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBasedMenu = () => {
    const role = employee?.role;
    
    const commonItems = [
      { name: 'Dashboard', href: '/', icon: Activity, current: true },
      { name: 'Patients', href: '/patients', icon: Users },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
    ];

    switch (role) {
      case 'admin':
        return [
          ...commonItems,
          { name: 'Queue Management', href: '/queue', icon: ClipboardList },
          { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
          { name: 'Billing', href: '/billing', icon: CreditCard },
          { name: 'Lab Orders', href: '/lab-orders', icon: TestTube },
          { name: 'Reports', href: '/reports', icon: Activity },
          { name: 'Patient Portal', href: '/patient-portal', icon: UserCheck },
          { name: 'Notifications', href: '/notifications', icon: Bell },
          { name: 'Audit Logs', href: '/admin/audit-logs', icon: Bell },
          { name: 'Backup Management', href: '/admin/backup', icon: UserCheck },
          { name: 'Settings', href: '/settings', icon: Bell },
        ];
      case 'doctor':
        return [
          ...commonItems,
          { name: 'My Queue', href: '/queue', icon: ClipboardList },
          { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
          { name: 'Lab Orders', href: '/lab-orders', icon: TestTube },
        ];
      case 'receptionist':
        return [
          ...commonItems,
          { name: 'Queue Management', href: '/queue', icon: ClipboardList },
          { name: 'Billing', href: '/billing', icon: CreditCard },
        ];
      case 'medrep':
        return [
          { name: 'MedRep Dashboard', href: '/medrep/dashboard', icon: UserCheck, current: true },
          { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
          { name: 'Delivery Tracking', href: '/deliveries', icon: UserCheck },
        ];
      case 'patient':
        return [
          { name: 'My Appointments', href: '/my-appointments', icon: Calendar },
          { name: 'My Prescriptions', href: '/my-prescriptions', icon: FileText },
          { name: 'My Lab Results', href: '/my-lab-results', icon: TestTube },
          { name: 'My Billing', href: '/my-billing', icon: CreditCard },
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getRoleBasedMenu();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mr-4">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MediNext
                </h1>
                <p className="text-sm text-gray-500">Healthcare Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{employee?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{employee?.role}</p>
              </div>
              <button 
                onClick={logout} 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                aria-label="Logout from the system"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 mb-3">Dashboard</h2>
              <p className="text-gray-600 text-lg">Welcome to MediNext. Select a module to get started.</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                <p className="text-sm text-gray-500">Last login</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  item.current 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-100' 
                    : 'border-white/20 hover:border-blue-300 hover:bg-white/90'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`Navigate to ${item.name}`}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-4 rounded-xl transition-all duration-300 ${
                    item.current 
                      ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 shadow-lg' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600 group-hover:shadow-lg'
                  }`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      item.current 
                        ? 'text-blue-900' 
                        : 'text-gray-900 group-hover:text-blue-900'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      item.current 
                        ? 'text-blue-700' 
                        : 'text-gray-500 group-hover:text-blue-700'
                    }`}>
                      {item.current ? 'Current page' : 'Click to access'}
                    </p>
                  </div>
                </div>
                {item.current && (
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700">Quick Overview</h3>
            <div className="hidden md:block">
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <span className="text-sm text-gray-500">Real-time data</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl group-hover:from-yellow-200 group-hover:to-yellow-300 transition-all duration-300">
                    <ClipboardList className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Queue Length</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mr-3">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">MediNext</p>
                <p className="text-xs text-gray-500">Healthcare Management Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} MediNext. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Secure • Reliable • Efficient
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
