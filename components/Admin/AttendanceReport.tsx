'use client';

import React, { useState } from 'react';
import { generateAttendanceReport } from '@/lib/database';
import { Download, Calendar, FileText } from 'lucide-react';

export default function AttendanceReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{
    id: string;
    employeeId?: string;
    startDate: string;
    endDate: string;
    totalWorkTime: number;
    totalBreakTime: number;
    workDays: number;
    averageWorkTime: number;
    overtime: number;
    generatedAt: Date;
    generatedBy: string;
  } | null>(null);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const reportData = await generateAttendanceReport(
        selectedEmployee || null,
        startDate,
        endDate,
        'admin' // This should be the actual admin user ID
      );
      setReport({
        id: reportData._id.toString(),
        employeeId: reportData.employeeId?.toString(),
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        totalWorkTime: reportData.totalWorkTime,
        totalBreakTime: reportData.totalBreakTime,
        workDays: reportData.workDays,
        averageWorkTime: reportData.averageWorkTime,
        overtime: reportData.overtime,
        generatedAt: reportData.generatedAt,
        generatedBy: reportData.generatedBy.toString()
      });
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    const csvContent = [
      ['Employee ID', 'Start Date', 'End Date', 'Total Work Time (hours)', 'Total Break Time (hours)', 'Work Days', 'Average Work Time (hours)', 'Overtime (hours)'],
      [
        report.employeeId || 'All Employees',
        report.startDate,
        report.endDate,
        (report.totalWorkTime / 60).toFixed(2),
        (report.totalBreakTime / 60).toFixed(2),
        report.workDays,
        (report.averageWorkTime / 60).toFixed(2),
        (report.overtime / 60).toFixed(2)
      ]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Report Generation Form */}
      <div className="card p-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Generate Attendance Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employee (Optional)
            </label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input-field"
            >
              <option value="">All Employees</option>
              <option value="employee1">John Doe</option>
              <option value="employee2">Jane Smith</option>
              <option value="employee3">Mike Johnson</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-4 w-4" />
          <span>{loading ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>

      {/* Report Results */}
      {report && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Report Results</h3>
            <button
              onClick={handleExportCSV}
              className="btn-success flex items-center space-x-2 px-3 py-2 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {(report.totalWorkTime / 60).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Work Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {(report.totalBreakTime / 60).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Break Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {report.workDays}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Work Days</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {(report.averageWorkTime / 60).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg Hours/Day</div>
            </div>
          </div>

          {report.overtime > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Overtime: {(report.overtime / 60).toFixed(1)} hours
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Reports */}
      <div className="card p-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
            }}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
          >
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
            <div className="font-medium text-sm text-gray-900 dark:text-white">Today&apos;s Report</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Generate report for today</div>
          </button>
          
          <button
            onClick={() => {
              const today = new Date();
              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
              const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
              setStartDate(weekStart.toISOString().split('T')[0]);
              setEndDate(weekEnd.toISOString().split('T')[0]);
            }}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
          >
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mb-2" />
            <div className="font-medium text-sm text-gray-900 dark:text-white">This Week</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Generate report for this week</div>
          </button>
          
          <button
            onClick={() => {
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              setStartDate(monthStart.toISOString().split('T')[0]);
              setEndDate(monthEnd.toISOString().split('T')[0]);
            }}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
          >
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-2" />
            <div className="font-medium text-sm text-gray-900 dark:text-white">This Month</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Generate report for this month</div>
          </button>
        </div>
      </div>
    </div>
  );
}
