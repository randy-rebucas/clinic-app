'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, TrendingUp, Users, Calendar, FileText, CreditCard, TestTube, Download } from 'lucide-react';

interface ReportData {
  totalPatients: number;
  totalAppointments: number;
  totalPrescriptions: number;
  totalRevenue: number;
  totalLabOrders: number;
  monthlyStats: {
    month: string;
    patients: number;
    appointments: number;
    revenue: number;
  }[];
  topDoctors: {
    doctorId: string;
    doctorName: string;
    appointmentCount: number;
  }[];
  appointmentTypes: {
    type: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

export default function ReportsPage() {
  const { user, employee } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchReportData();
    }
  }, [user, employee, selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, this would fetch from your API
      const mockData: ReportData = {
        totalPatients: 1247,
        totalAppointments: 3421,
        totalPrescriptions: 2156,
        totalRevenue: 125430.50,
        totalLabOrders: 892,
        monthlyStats: [
          { month: 'Jan', patients: 45, appointments: 120, revenue: 15420.00 },
          { month: 'Feb', patients: 52, appointments: 135, revenue: 16850.00 },
          { month: 'Mar', patients: 48, appointments: 128, revenue: 16230.00 },
          { month: 'Apr', patients: 61, appointments: 145, revenue: 18240.00 },
          { month: 'May', patients: 55, appointments: 138, revenue: 17560.00 },
          { month: 'Jun', patients: 58, appointments: 142, revenue: 17980.00 },
        ],
        topDoctors: [
          { doctorId: 'DR-001', doctorName: 'Dr. Smith', appointmentCount: 245 },
          { doctorId: 'DR-002', doctorName: 'Dr. Johnson', appointmentCount: 198 },
          { doctorId: 'DR-003', doctorName: 'Dr. Williams', appointmentCount: 176 },
          { doctorId: 'DR-004', doctorName: 'Dr. Brown', appointmentCount: 154 },
        ],
        appointmentTypes: [
          { type: 'Consultation', count: 1250 },
          { type: 'Follow-up', count: 890 },
          { type: 'Routine', count: 680 },
          { type: 'Emergency', count: 201 },
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 15420.00 },
          { month: 'Feb', revenue: 16850.00 },
          { month: 'Mar', revenue: 16230.00 },
          { month: 'Apr', revenue: 18240.00 },
          { month: 'May', revenue: 17560.00 },
          { month: 'Jun', revenue: 17980.00 },
        ]
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
      currency: 'PHP'
    }).format(amount);
  };

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // In production, this would generate and download the actual report
    console.log(`Exporting report as ${format}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportReport('pdf')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {reportData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalPatients.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalAppointments.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalPrescriptions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TestTube className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lab Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalLabOrders.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Stats Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Statistics</h3>
                <div className="space-y-4">
                  {reportData.monthlyStats.map((stat) => (
                    <div key={stat.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{stat.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Patients</p>
                          <p className="font-semibold">{stat.patients}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Appointments</p>
                          <p className="font-semibold">{stat.appointments}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Revenue</p>
                          <p className="font-semibold">{formatCurrency(stat.revenue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Doctors */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Doctors</h3>
                <div className="space-y-4">
                  {reportData.topDoctors.map((doctor, index) => (
                    <div key={doctor.doctorId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doctor.doctorName}</p>
                          <p className="text-sm text-gray-500">{doctor.doctorId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{doctor.appointmentCount}</p>
                        <p className="text-sm text-gray-500">appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Appointment Types */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Types Distribution</h3>
                <div className="space-y-3">
                  {reportData.appointmentTypes.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{type.type}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(type.count / Math.max(...reportData.appointmentTypes.map(t => t.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="space-y-3">
                  {reportData.revenueByMonth.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{month.month}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(month.revenue / Math.max(...reportData.revenueByMonth.map(m => m.revenue))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-20 text-right">{formatCurrency(month.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Revenue per Patient</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.totalRevenue / reportData.totalPatients)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Appointments per Day</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(reportData.totalAppointments / 30)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prescription Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((reportData.totalPrescriptions / reportData.totalAppointments) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
