'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Link from 'next/link';
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
  Bell
} from 'lucide-react';

export default function Home() {
  const { user, employee, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Clinic Management System
            </h1>
            <p className="mt-2 text-gray-600">
              Access your clinic portal or patient portal
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Portal</h2>
              <LoginForm />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Portal</h2>
              <div className="space-y-3">
                <Link
                  href="/patient/login"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                >
                  Patient Login
                </Link>
                <Link
                  href="/patient/register"
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center block"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Clinic Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {employee?.name} ({employee?.role})
              </span>
              <button 
                onClick={logout} 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to the clinic management system. Select a module to get started.</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
                  item.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${
                    item.current ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${
                      item.current ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm ${
                      item.current ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-700'
                    }`}>
                      {item.current ? 'Current page' : 'Click to access'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Queue Length</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
