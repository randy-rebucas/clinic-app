'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  FlaskConical, 
  Clock, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserPlus,
  CalendarPlus,
  DollarSign,
  FilePlus,
  TestTube,
  List,
  PieChart,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalPrescriptions: number;
  totalLabOrders: number;
  queueLength: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'patient' | 'appointment' | 'prescription' | 'payment' | 'lab';
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const { user, employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalPrescriptions: 0,
    totalLabOrders: 0,
    queueLength: 0,
    activeUsers: 0,
    systemHealth: 'healthy'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, employee]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from various APIs with error handling
      const [patientsRes, appointmentsRes, billingRes, prescriptionsRes, labRes, queueRes, usersRes] = await Promise.allSettled([
        fetch('/api/patients'),
        fetch('/api/appointments'),
        fetch('/api/billing/summary'),
        fetch('/api/prescriptions'),
        fetch('/api/lab-orders'),
        fetch('/api/queue'),
        fetch('/api/auth/user')
      ]);

      const [patients, appointments, billing, prescriptions, labOrders, queue, users] = await Promise.all([
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.json() : Promise.resolve([]),
        billingRes.status === 'fulfilled' ? billingRes.value.json() : Promise.resolve({ totalRevenue: 0 }),
        prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.json() : Promise.resolve([]),
        labRes.status === 'fulfilled' ? labRes.value.json() : Promise.resolve([]),
        queueRes.status === 'fulfilled' ? queueRes.value.json() : Promise.resolve([]),
        usersRes.status === 'fulfilled' ? usersRes.value.json() : Promise.resolve([])
      ]);

      setStats({
        totalPatients: patients.length || 0,
        totalAppointments: appointments.length || 0,
        totalRevenue: billing.totalRevenue || 0,
        totalPrescriptions: prescriptions.length || 0,
        totalLabOrders: labOrders.length || 0,
        queueLength: queue.length || 0,
        activeUsers: users.filter((u: any) => u.isActive).length || 0,
        systemHealth: 'healthy'
      });

      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'patient',
          action: 'New patient registered',
          user: 'Dr. Smith',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'appointment',
          action: 'Appointment scheduled',
          user: 'Receptionist',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'prescription',
          action: 'Prescription created',
          user: 'Dr. Johnson',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'payment',
          action: 'Payment processed',
          user: 'System',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'success'
        },
        {
          id: '5',
          type: 'lab',
          action: 'Lab results uploaded',
          user: 'Lab Technician',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          status: 'success'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'prescription':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case 'lab':
        return <FlaskConical className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user || employee?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-10 w-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">System Administration & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-white font-medium">Welcome, {employee?.name}</p>
                <p className="text-blue-100 text-sm">Administrator</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemHealth === 'healthy' ? 'bg-green-400' : 
                  stats.systemHealth === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white font-medium capitalize">{stats.systemHealth}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
          )}
          {!loading && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Module Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Management */}
          <Link href="/patients" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Patient Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage patient records, demographics, and medical history</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.totalPatients} patients</span>
                <UserPlus className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </div>
          </Link>

          {/* Appointment Management */}
          <Link href="/appointments" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Appointments</h3>
              </div>
              <p className="text-gray-600 mb-4">Schedule and manage patient appointments</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.totalAppointments} appointments</span>
                <CalendarPlus className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
              </div>
            </div>
          </Link>

          {/* Billing Management */}
          <Link href="/billing" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <CreditCard className="h-8 w-8 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Billing & Payments</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage invoices, payments, and financial records</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{formatCurrency(stats.totalRevenue)} revenue</span>
                <DollarSign className="h-4 w-4 text-gray-400 group-hover:text-yellow-600" />
              </div>
            </div>
          </Link>

          {/* Prescription Management */}
          <Link href="/prescriptions" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Prescriptions</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage medication prescriptions and refills</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.totalPrescriptions} prescriptions</span>
                <FilePlus className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
              </div>
            </div>
          </Link>

          {/* Lab Management */}
          <Link href="/lab-orders" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <FlaskConical className="h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Lab Orders</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage laboratory tests and results</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.totalLabOrders} lab orders</span>
                <TestTube className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
              </div>
            </div>
          </Link>

          {/* Queue Management */}
          <Link href="/queue" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Queue Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage patient queue and waiting times</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.queueLength} in queue</span>
                <List className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
              </div>
            </div>
          </Link>

          {/* Reports & Analytics */}
          <Link href="/reports" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Reports & Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">View system reports and analytics</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">View reports</span>
                <PieChart className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </Link>

          {/* User Management */}
          <Link href="/admin/users" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
              <div className="flex items-center mb-4">
                <UserCheck className="h-8 w-8 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-3">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage users, roles, and permissions</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{stats.activeUsers} active users</span>
                <UserPlus className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
              </div>
            </div>
          </Link>

          {/* System Administration */}
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/audit-logs" className="group">
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Audit Logs</h3>
                </div>
                <p className="text-gray-600 mb-4">View system audit logs and security events</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Security monitoring</span>
                  <Shield className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
            </Link>

            <Link href="/admin/backup" className="group">
              <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50 transition-shadow">
                <div className="flex items-center mb-4">
                  <Database className="h-8 w-8 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Backup Management</h3>
                </div>
                <p className="text-gray-600 mb-4">Create and manage system backups</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Data protection</span>
                  <Database className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
            </Link>
          </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading recent activity...</div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Activity will appear here as users interact with the system.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">by {activity.user}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(activity.status)}
                      <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                    </div>
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
