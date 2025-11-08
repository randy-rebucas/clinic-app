'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  CreditCard, 
  UserPlus,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  queueLength: number;
  pendingPayments: number;
  newPatientsToday: number;
  completedAppointments: number;
}

interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  reason: string;
}

interface QueueItem {
  _id: string;
  queueId: string;
  patientId: string;
  priority: string;
  status: string;
  reason: string;
}

export default function ReceptionistDashboard() {
  const { user, employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    queueLength: 0,
    pendingPayments: 0,
    newPatientsToday: 0,
    completedAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && employee?.role === 'receptionist') {
      fetchDashboardData();
    }
  }, [user, employee]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];

      const [patientsRes, appointmentsRes, queueRes, billingRes] = await Promise.allSettled([
        fetch('/api/patients'),
        fetch(`/api/appointments?date=${today}`),
        fetch('/api/queue'),
        fetch('/api/billing/summary')
      ]);

      const [patientsData, appointmentsData, queueData, billingData] = await Promise.all([
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.json() : Promise.resolve([]),
        queueRes.status === 'fulfilled' ? queueRes.value.json() : Promise.resolve([]),
        billingRes.status === 'fulfilled' ? billingRes.value.json() : Promise.resolve({})
      ]);

      const patients = Array.isArray(patientsData) ? patientsData : [];
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      const queue = Array.isArray(queueData) ? queueData : [];

      const todayApts = appointments.filter((apt: any) => apt.appointmentDate.startsWith(today));
      const waitingQueue = queue.filter((q: any) => q.status === 'waiting' || q.status === 'in-progress');
      const newPatients = patients.filter((p: any) => 
        new Date(p.createdAt).toISOString().split('T')[0] === today
      );
      const completedApts = appointments.filter((apt: any) => 
        apt.status === 'completed' && apt.appointmentDate.startsWith(today)
      );

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayApts.length,
        queueLength: waitingQueue.length,
        pendingPayments: billingData?.outstanding || 0,
        newPatientsToday: newPatients.length,
        completedAppointments: completedApts.length,
      });

      setTodayAppointments(todayApts.slice(0, 5));
      setQueueItems(waitingQueue.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || employee?.role !== 'receptionist') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to receptionists.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Queue Length</p>
                <p className="text-2xl font-bold text-gray-900">{stats.queueLength}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayments)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Patients Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newPatientsToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/patients/new" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <UserPlus className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Register Patient</span>
            </div>
          </Link>
          <Link href="/appointments/new" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Schedule Appointment</span>
            </div>
          </Link>
          <Link href="/queue" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <ClipboardList className="h-6 w-6 text-orange-600 mr-3" />
              <span className="font-medium text-gray-900">Manage Queue</span>
            </div>
          </Link>
          <Link href="/billing" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-yellow-600 mr-3" />
              <span className="font-medium text-gray-900">Process Payment</span>
            </div>
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Today&apos;s Appointments</h3>
            <Link href="/appointments" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No appointments scheduled for today</div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{apt.reason}</p>
                      <p className="text-sm text-gray-500">{formatTime(apt.startTime)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Queue Items */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Current Queue</h3>
            <Link href="/queue" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : queueItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No patients in queue</div>
            ) : (
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.reason}</p>
                      <p className="text-sm text-gray-500">Queue ID: {item.queueId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

