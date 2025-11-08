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
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalPrescriptions: number;
  totalLabOrders: number;
  averageWaitTime: number;
  patientGrowth: number;
  revenueGrowth: number;
  appointmentTrends: Array<{ date: string; count: number }>;
  revenueTrends: Array<{ date: string; amount: number }>;
  departmentStats: Array<{ department: string; count: number; revenue: number }>;
  topDoctors: Array<{ name: string; appointments: number; revenue: number }>;
  monthlyStats: Array<{ month: string; patients: number; appointments: number; revenue: number }>;
}

export default function ReportsPage() {
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
      
      // Mock data - in production, this would fetch from your API
      const mockData: ReportData = {
        totalPatients: 1247,
        totalAppointments: 3421,
        totalRevenue: 125430.50,
        totalPrescriptions: 892,
        totalLabOrders: 456,
        averageWaitTime: 15.5,
        patientGrowth: 12.5,
        revenueGrowth: 8.3,
        appointmentTrends: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 38 },
          { date: '2024-01-04', count: 61 },
          { date: '2024-01-05', count: 47 },
          { date: '2024-01-06', count: 39 },
          { date: '2024-01-07', count: 55 },
        ],
        revenueTrends: [
          { date: '2024-01-01', amount: 1250.00 },
          { date: '2024-01-02', amount: 1890.50 },
          { date: '2024-01-03', amount: 1420.75 },
          { date: '2024-01-04', amount: 2100.25 },
          { date: '2024-01-05', amount: 1650.00 },
          { date: '2024-01-06', amount: 1380.50 },
          { date: '2024-01-07', amount: 1950.75 },
        ],
        departmentStats: [
          { department: 'Cardiology', count: 245, revenue: 45230.50 },
          { department: 'Neurology', count: 189, revenue: 32150.75 },
          { department: 'Orthopedics', count: 156, revenue: 28940.25 },
          { department: 'Pediatrics', count: 203, revenue: 18920.50 },
          { department: 'Emergency', count: 98, revenue: 1189.50 },
        ],
        topDoctors: [
          { name: 'Dr. Sarah Johnson', appointments: 156, revenue: 23450.75 },
          { name: 'Dr. Michael Chen', appointments: 142, revenue: 19820.50 },
          { name: 'Dr. Emily Rodriguez', appointments: 138, revenue: 18750.25 },
          { name: 'Dr. David Kim', appointments: 125, revenue: 16540.00 },
          { name: 'Dr. Lisa Wang', appointments: 118, revenue: 15230.50 },
        ],
        monthlyStats: [
          { month: 'Jan 2024', patients: 145, appointments: 342, revenue: 45230.50 },
          { month: 'Feb 2024', patients: 156, appointments: 389, revenue: 52150.75 },
          { month: 'Mar 2024', patients: 142, appointments: 365, revenue: 48920.25 },
          { month: 'Apr 2024', patients: 168, appointments: 412, revenue: 56230.50 },
          { month: 'May 2024', patients: 189, appointments: 445, revenue: 61240.75 },
          { month: 'Jun 2024', patients: 203, appointments: 478, revenue: 67890.25 },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data');
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    alert(`Exporting report as ${format.toUpperCase()}...`);
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
      <header className="bg-white shadow-sm-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Go back to dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchReportData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'financial', label: 'Financial', icon: DollarSign },
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'departments', label: 'Departments', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`flex items-center py-4 px-1 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]-2 font-medium text-sm ${
                    selectedReport === tab.id
                      ? 'shadow-[0_1px_0_0_rgba(0,0,0,0.05)]lue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <div className="text-gray-600">Loading report data...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
          </div>
        ) : reportData ? (
          <>
            {/* Overview Report */}
            {selectedReport === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.totalPatients.toLocaleString()}</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {formatPercentage(reportData.patientGrowth)}
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
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {formatPercentage(reportData.revenueGrowth)}
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

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Chart visualization would go here</p>
                        <p className="text-sm text-gray-400">7 days of appointment data</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Chart visualization would go here</p>
                        <p className="text-sm text-gray-400">7 days of revenue data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Report */}
            {selectedReport === 'financial' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Department</h3>
                  <div className="space-y-4">
                    {reportData.departmentStats.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{dept.department}</p>
                          <p className="text-sm text-gray-500">{dept.count} appointments</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(dept.revenue)}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(dept.revenue / dept.count)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Doctors</h3>
                  <div className="space-y-4">
                    {reportData.topDoctors.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.appointments} appointments</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(doctor.revenue)}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(doctor.revenue / doctor.appointments)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Report */}
            {selectedReport === 'patients' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{reportData.totalPatients}</p>
                      <p className="text-sm text-gray-500">Total Patients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{formatPercentage(reportData.patientGrowth)}</p>
                      <p className="text-sm text-gray-500">Growth Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{Math.round(reportData.totalPatients / 6)}</p>
                      <p className="text-sm text-gray-500">Avg per Month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Patient Growth</h3>
                  <div className="space-y-4">
                    {reportData.monthlyStats.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{month.month}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{month.patients} patients</p>
                          <p className="text-sm text-gray-500">{month.appointments} appointments</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Report */}
            {selectedReport === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{reportData.totalAppointments}</p>
                      <p className="text-sm text-gray-500">Total Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{Math.round(reportData.totalAppointments / 6)}</p>
                      <p className="text-sm text-gray-500">Avg per Month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{reportData.averageWaitTime} min</p>
                      <p className="text-sm text-gray-500">Avg Wait Time</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Appointment Trends</h3>
                  <div className="space-y-4">
                    {reportData.monthlyStats.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{month.month}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{month.appointments} appointments</p>
                          <p className="text-sm text-gray-500">{formatCurrency(month.revenue)} revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Department Report */}
            {selectedReport === 'departments' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h3>
                  <div className="space-y-4">
                    {reportData.departmentStats.map((dept, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{dept.department}</h4>
                          <span className="text-sm text-gray-500">{dept.count} appointments</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(dept.revenue)}</span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(dept.revenue / dept.count)} avg per appointment
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}