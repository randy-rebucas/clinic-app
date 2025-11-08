'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  Activity,
  RefreshCw,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  myAppointments: number;
  totalPatients: number;
  documents: number;
  upcomingTasks: number;
}

export default function EmployeeDashboard() {
  const { user, employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    myAppointments: 0,
    totalPatients: 0,
    documents: 0,
    upcomingTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && employee?.role === 'employee') {
      fetchDashboardData();
    }
  }, [user, employee]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsRes, appointmentsRes] = await Promise.allSettled([
        fetch('/api/patients'),
        fetch('/api/appointments')
      ]);

      const [patientsData, appointmentsData] = await Promise.all([
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.json() : Promise.resolve([])
      ]);

      const patients = Array.isArray(patientsData) ? patientsData : [];
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

      const myAppointments = appointments.filter((apt: any) => 
        apt.doctorId === employee?.id || apt.status === 'scheduled'
      );

      setStats({
        myAppointments: myAppointments.length,
        totalPatients: patients.length,
        documents: 0, // Placeholder
        upcomingTasks: myAppointments.filter((apt: any) => 
          new Date(apt.appointmentDate) > new Date()
        ).length,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!user || employee?.role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to employees.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {employee?.name}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myAppointments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/appointments" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">View Appointments</span>
            </div>
          </Link>
          <Link href="/patients" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">View Patients</span>
            </div>
          </Link>
          <Link href="/notifications" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Info className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Notifications</span>
            </div>
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Your Dashboard</h3>
              <p className="text-gray-600">
                As an employee, you have access to view appointments, patients, and other relevant information.
                Contact your administrator if you need additional permissions or access to specific features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

