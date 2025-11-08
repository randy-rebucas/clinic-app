'use client';

import React, { useState, useEffect } from 'react';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  FileText, 
  TestTube, 
  CreditCard, 
  User, 
  Bell,
  Heart,
  Activity
} from 'lucide-react';

export default function PatientDashboard() {
  const { patient, loading, logout } = usePatientAuth();
  const router = useRouter();
  const [stats] = useState({
    upcomingAppointments: 0,
    pendingPrescriptions: 0,
    labResults: 0,
    outstandingBills: 0
  });

  useEffect(() => {
    if (!loading && !patient) {
      router.push('/patient/login');
    }
  }, [patient, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const menuItems = [
    { name: 'My Appointments', href: '/patient/appointments', icon: Calendar, color: 'blue' },
    { name: 'My Prescriptions', href: '/patient/prescriptions', icon: FileText, color: 'green' },
    { name: 'Lab Results', href: '/patient/lab-results', icon: TestTube, color: 'purple' },
    { name: 'Billing & Payments', href: '/patient/billing', icon: CreditCard, color: 'orange' },
    { name: 'Profile Settings', href: '/patient/profile', icon: User, color: 'gray' },
    { name: 'Notifications', href: '/patient/notifications', icon: Bell, color: 'yellow' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {patient.firstName} {patient.lastName}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {patient.patientId}
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
          <p className="text-gray-600">Manage your healthcare information and appointments.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Results</p>
                <p className="text-2xl font-bold text-gray-900">{stats.labResults}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outstandingBills}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="group relative bg-white p-6 rounded-lg shadow-sm-2 border-gray-200 transition-all duration-200 hover:shadow-md hover:shadow-[0_1px_0_0_rgba(0,0,0,0.05)]lue-300"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-blue-700">
                      Click to access
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
                <p className="text-gray-600">Your recent appointments, prescriptions, and lab results will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}