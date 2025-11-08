'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  FlaskConical, 
  Clock,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  CreditCard,
  TestTube,
  ClipboardList
} from 'lucide-react';

interface ReportData {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalPrescriptions: number;
  totalLabOrders: number;
  totalInvoices: number;
  totalPayments: number;
  queueLength: number;
  averageWaitTime: number;
  patientGrowth: number;
  revenueGrowth: number;
  appointmentTrends: Array<{ date: string; count: number }>;
  revenueTrends: Array<{ date: string; amount: number }>;
  departmentStats: Array<{ department: string; count: number; revenue: number }>;
  topDoctors: Array<{ name: string; appointments: number; revenue: number }>;
  monthlyStats: Array<{ month: string; patients: number; appointments: number; revenue: number }>;
}

export default function AdminReportsPage() {
  const { user, employee } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchReportData();
    }
  }, [user, employee, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const [
        patientsRes,
        appointmentsRes,
        billingRes,
        prescriptionsRes,
        labOrdersRes,
        queueRes,
        usersRes
      ] = await Promise.allSettled([
        fetch('/api/patients'),
        fetch('/api/appointments'),
        fetch('/api/billing/summary'),
        fetch('/api/prescriptions'),
        fetch('/api/lab-orders'),
        fetch('/api/queue'),
        fetch('/api/auth/user?all=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [
        patientsData,
        appointmentsData,
        billingData,
        prescriptionsData,
        labOrdersData,
        queueData,
        usersData
      ] = await Promise.all([
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.json() : Promise.resolve([]),
        billingRes.status === 'fulfilled' ? billingRes.value.json() : Promise.resolve({ totalRevenue: 0 }),
        prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.json() : Promise.resolve([]),
        labOrdersRes.status === 'fulfilled' ? labOrdersRes.value.json() : Promise.resolve([]),
        queueRes.status === 'fulfilled' ? queueRes.value.json() : Promise.resolve([]),
        usersRes.status === 'fulfilled' ? usersRes.value.json() : Promise.resolve([])
      ]);

      const patients = Array.isArray(patientsData) ? patientsData : [];
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      const prescriptions = Array.isArray(prescriptionsData) ? prescriptionsData : [];
      const labOrders = Array.isArray(labOrdersData) ? labOrdersData : [];
      const queue = Array.isArray(queueData) ? queueData : [];
      const users = Array.isArray(usersData) ? usersData : [];

      // Calculate stats
      const totalRevenue = billingData?.totalRevenue || 0;
      const totalInvoices = billingData?.invoiceCount || 0;
      const totalPayments = billingData?.paymentCount || 0;

      // Calculate average wait time
      const completedQueue = queue.filter((q: any) => q.status === 'completed' && q.actualWaitTime);
      const avgWaitTime = completedQueue.length > 0
        ? completedQueue.reduce((sum: number, q: any) => sum + (q.actualWaitTime || 0), 0) / completedQueue.length
        : 0;

      // Mock trends (in production, calculate from actual data)
      const appointmentTrends = appointments.slice(0, 7).map((apt: any, index: number) => ({
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 30
      }));

      const revenueTrends = appointmentTrends.map(trend => ({
        date: trend.date,
        amount: trend.count * 150 // Mock calculation
      }));

      // Department stats (mock - would need department data)
      const departmentStats = [
        { department: 'Cardiology', count: Math.floor(appointments.length * 0.25), revenue: totalRevenue * 0.25 },
        { department: 'Neurology', count: Math.floor(appointments.length * 0.20), revenue: totalRevenue * 0.20 },
        { department: 'Orthopedics', count: Math.floor(appointments.length * 0.18), revenue: totalRevenue * 0.18 },
        { department: 'Pediatrics', count: Math.floor(appointments.length * 0.15), revenue: totalRevenue * 0.15 },
        { department: 'Emergency', count: Math.floor(appointments.length * 0.22), revenue: totalRevenue * 0.22 },
      ];

      // Top doctors (mock - would need actual doctor data)
      const doctors = users.filter((u: any) => u.role === 'doctor');
      const topDoctors = doctors.slice(0, 5).map((doctor: any) => ({
        name: doctor.name,
        appointments: Math.floor(appointments.length / doctors.length),
        revenue: totalRevenue / doctors.length
      }));

      // Monthly stats (mock)
      const monthlyStats = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          patients: Math.floor(patients.length / 6),
          appointments: Math.floor(appointments.length / 6),
          revenue: totalRevenue / 6
        };
      });

      setReportData({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalRevenue,
        totalPrescriptions: prescriptions.length,
        totalLabOrders: labOrders.length,
        totalInvoices,
        totalPayments,
        queueLength: queue.length,
        averageWaitTime: Math.round(avgWaitTime * 10) / 10,
        patientGrowth: 12.5, // Mock
        revenueGrowth: 8.3, // Mock
        appointmentTrends,
        revenueTrends,
        departmentStats,
        topDoctors,
        monthlyStats
      });
    } catch (err) {
      console.error('Error loading report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report data');
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <button
                onClick={fetchReportData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading report data...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalPatients.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {reportData.patientGrowth}% growth
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalAppointments.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {reportData.revenueGrowth}% growth
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.averageWaitTime} min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalPrescriptions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <TestTube className="h-8 w-8 text-pink-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lab Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalLabOrders.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalInvoices.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <ClipboardList className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Queue Length</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.queueLength.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.departmentStats.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(dept.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Doctors */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Doctors</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.topDoctors.map((doctor, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(doctor.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.monthlyStats.map((month, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{month.patients}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{month.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

