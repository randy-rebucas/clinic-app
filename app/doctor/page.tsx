'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  ClipboardList, 
  FileText, 
  TestTube, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  todayAppointments: number;
  upcomingAppointments: number;
  queueLength: number;
  pendingPrescriptions: number;
  pendingLabOrders: number;
  completedToday: number;
}

interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
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

export default function DoctorDashboard() {
  const { user, employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    upcomingAppointments: 0,
    queueLength: 0,
    pendingPrescriptions: 0,
    pendingLabOrders: 0,
    completedToday: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && employee?.role === 'doctor') {
      fetchDashboardData();
    }
  }, [user, employee]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];

      const [appointmentsRes, queueRes, prescriptionsRes, labOrdersRes] = await Promise.allSettled([
        fetch(`/api/appointments?doctorId=${employee?.id}&date=${today}`),
        fetch('/api/queue'),
        fetch('/api/prescriptions'),
        fetch('/api/lab-orders')
      ]);

      const [appointmentsData, queueData, prescriptionsData, labOrdersData] = await Promise.all([
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.json() : Promise.resolve([]),
        queueRes.status === 'fulfilled' ? queueRes.value.json() : Promise.resolve([]),
        prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.json() : Promise.resolve([]),
        labOrdersRes.status === 'fulfilled' ? labOrdersRes.value.json() : Promise.resolve([])
      ]);

      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      const queue = Array.isArray(queueData) ? queueData : [];
      const prescriptions = Array.isArray(prescriptionsData) ? prescriptionsData : [];
      const labOrders = Array.isArray(labOrdersData) ? labOrdersData : [];

      // Filter doctor-specific data
      const myQueue = queue.filter((q: any) => q.assignedDoctorId === employee?.id || q.status === 'waiting');
      const myPrescriptions = prescriptions.filter((p: any) => p.doctorId === employee?.id && p.status === 'pending');
      const myLabOrders = labOrders.filter((l: any) => l.doctorId === employee?.id && l.status === 'ordered');

      const todayApts = appointments.filter((apt: any) => apt.status !== 'completed' && apt.status !== 'cancelled');
      const upcomingApts = appointments.filter((apt: any) => 
        new Date(apt.appointmentDate) > new Date() && apt.status === 'scheduled'
      );
      const completedToday = appointments.filter((apt: any) => 
        apt.status === 'completed' && apt.appointmentDate.startsWith(today)
      );

      setStats({
        todayAppointments: todayApts.length,
        upcomingAppointments: upcomingApts.length,
        queueLength: myQueue.filter((q: any) => q.status === 'waiting' || q.status === 'in-progress').length,
        pendingPrescriptions: myPrescriptions.length,
        pendingLabOrders: myLabOrders.length,
        completedToday: completedToday.length,
      });

      setTodayAppointments(todayApts.slice(0, 5));
      setQueueItems(myQueue.filter((q: any) => q.status === 'waiting' || q.status === 'in-progress').slice(0, 5));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || employee?.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to doctors.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, Dr. {employee?.name}</p>
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
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
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
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Lab Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingLabOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/appointments" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">View Appointments</span>
            </div>
          </Link>
          <Link href="/queue" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <ClipboardList className="h-6 w-6 text-orange-600 mr-3" />
              <span className="font-medium text-gray-900">My Queue</span>
            </div>
          </Link>
          <Link href="/prescriptions" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Prescriptions</span>
            </div>
          </Link>
          <Link href="/lab-orders" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <TestTube className="h-6 w-6 text-red-600 mr-3" />
              <span className="font-medium text-gray-900">Lab Orders</span>
            </div>
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today&apos;s Appointments</h3>
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
                      <p className="text-sm text-gray-500">{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</p>
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Queue</h3>
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

