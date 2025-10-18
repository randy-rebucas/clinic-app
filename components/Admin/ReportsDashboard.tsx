'use client';

import React, { useState } from 'react';
import { 
  BarChart3, FileText, Download, Calendar, Users, Clock, 
  TrendingUp, Filter, RefreshCw, AlertTriangle
} from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'time_tracking' | 'employee' | 'attendance' | 'productivity';
  icon: React.ComponentType<{ className?: string }>;
  lastGenerated?: Date;
  recordCount?: number;
}

const availableReports: ReportData[] = [
  {
    id: 'daily-attendance',
    title: 'Daily Attendance Report',
    description: 'Daily attendance summary for all employees',
    type: 'attendance',
    icon: Calendar
  },
  {
    id: 'weekly-time-tracking',
    title: 'Weekly Time Tracking Report',
    description: 'Weekly time tracking summary and analysis',
    type: 'time_tracking',
    icon: Clock
  },
  {
    id: 'employee-productivity',
    title: 'Employee Productivity Report',
    description: 'Individual employee productivity metrics',
    type: 'productivity',
    icon: TrendingUp
  },
  {
    id: 'monthly-summary',
    title: 'Monthly Summary Report',
    description: 'Comprehensive monthly overview',
    type: 'time_tracking',
    icon: BarChart3
  },
  {
    id: 'employee-activity',
    title: 'Employee Activity Report',
    description: 'Detailed employee activity and screen captures',
    type: 'employee',
    icon: Users
  },
  {
    id: 'overtime-analysis',
    title: 'Overtime Analysis Report',
    description: 'Overtime hours and patterns analysis',
    type: 'time_tracking',
    icon: TrendingUp
  }
];

export default function ReportsDashboard() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [selectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          dateRange,
          employeeIds: selectedEmployees
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        setSelectedReport(reportId);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!selectedReport || !reportData) return;

    try {
      setLoading(true);

      const response = await fetch('/api/admin/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport,
          format,
          data: reportData,
          dateRange,
          employeeIds: selectedEmployees
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generate and export comprehensive reports for your organization
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Report Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Date Presets
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      startDate: weekAgo.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      startDate: monthAgo.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      startDate: yearAgo.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Last Year
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedReport === report.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => handleGenerateReport(report.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {report.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateReport(report.id);
                      }}
                      disabled={loading}
                      className="btn-primary px-3 py-1 text-sm flex items-center space-x-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Results */}
        {selectedReport && reportData && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {availableReports.find(r => r.id === selectedReport)?.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  disabled={loading}
                  className="btn-secondary px-3 py-2 text-sm flex items-center space-x-1 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  disabled={loading}
                  className="btn-secondary px-3 py-2 text-sm flex items-center space-x-1 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  disabled={loading}
                  className="btn-secondary px-3 py-2 text-sm flex items-center space-x-1 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              {selectedReport === 'daily-attendance' && (
                <DailyAttendanceReport data={reportData} />
              )}
              {selectedReport === 'weekly-time-tracking' && (
                <WeeklyTimeTrackingReport data={reportData} />
              )}
              {selectedReport === 'employee-productivity' && (
                <EmployeeProductivityReport data={reportData} />
              )}
              {selectedReport === 'monthly-summary' && (
                <MonthlySummaryReport data={reportData} />
              )}
              {selectedReport === 'employee-activity' && (
                <EmployeeActivityReport data={reportData} />
              )}
              {selectedReport === 'overtime-analysis' && (
                <OvertimeAnalysisReport data={reportData} />
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Report Components
function DailyAttendanceReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Daily Attendance Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{String(data?.totalEmployees || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Employees</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(data?.presentToday || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Present Today</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{String(data?.absentToday || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Absent Today</div>
        </div>
      </div>
    </div>
  );
}

function WeeklyTimeTrackingReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Time Tracking Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(data?.totalHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{String(data?.averageHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{String(data?.overtimeHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Overtime Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{String(data?.activeEmployees || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Employees</div>
        </div>
      </div>
    </div>
  );
}

function EmployeeProductivityReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Employee Productivity Metrics</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2">Employee</th>
              <th className="text-left py-2">Hours Worked</th>
              <th className="text-left py-2">Productivity Score</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.employees as Array<{ name: string; hoursWorked: number; productivityScore: number; status: string }>)?.map((emp, index: number) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{emp.name}</td>
                <td className="py-2">{emp.hoursWorked}</td>
                <td className="py-2">{emp.productivityScore}%</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    emp.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            )) || []}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlySummaryReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(data?.totalWorkDays || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Work Days</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{String(data?.totalHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{String(data?.averageDailyHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{String(data?.attendanceRate || 0)}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
        </div>
      </div>
    </div>
  );
}

function EmployeeActivityReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Employee Activity Details</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2">Employee</th>
              <th className="text-left py-2">Last Activity</th>
              <th className="text-left py-2">Screen Captures</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.activities as Array<{ employeeName: string; lastActivity: string; status: string; screenCaptures?: number }>)?.map((activity, index: number) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{activity.employeeName}</td>
                <td className="py-2">{new Date(activity.lastActivity).toLocaleString()}</td>
                <td className="py-2">{activity.screenCaptures || 0}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activity.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            )) || []}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OvertimeAnalysisReport({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Overtime Analysis</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{String(data?.totalOvertimeHours || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Overtime Hours</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{String(data?.employeesWithOvertime || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Employees with Overtime</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(data?.averageOvertime || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Overtime</div>
        </div>
      </div>
    </div>
  );
}
