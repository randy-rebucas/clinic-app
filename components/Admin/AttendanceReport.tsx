'use client';

import React, { useState } from 'react';
import { generateAttendanceReport } from '@/lib/database';
import { Download, Calendar, Filter, FileText } from 'lucide-react';

export default function AttendanceReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

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
      setReport(reportData);
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
    <div className="space-y-6">
      {/* Report Generation Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Attendance Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
              Employee (Optional)
            </label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-4 w-4" />
          <span>{loading ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>

      {/* Report Results */}
      {report && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Report Results</h3>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(report.totalWorkTime / 60).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Total Work Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(report.totalBreakTime / 60).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Total Break Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {report.workDays}
              </div>
              <div className="text-sm text-gray-500">Work Days</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(report.averageWorkTime / 60).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Avg Hours/Day</div>
            </div>
          </div>

          {report.overtime > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Overtime: {(report.overtime / 60).toFixed(1)} hours
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Reports */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Calendar className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Today's Report</div>
            <div className="text-sm text-gray-500">Generate report for today</div>
          </button>
          
          <button
            onClick={() => {
              const today = new Date();
              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
              const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
              setStartDate(weekStart.toISOString().split('T')[0]);
              setEndDate(weekEnd.toISOString().split('T')[0]);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">This Week</div>
            <div className="text-sm text-gray-500">Generate report for this week</div>
          </button>
          
          <button
            onClick={() => {
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              setStartDate(monthStart.toISOString().split('T')[0]);
              setEndDate(monthEnd.toISOString().split('T')[0]);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Calendar className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-medium text-gray-900">This Month</div>
            <div className="text-sm text-gray-500">Generate report for this month</div>
          </button>
        </div>
      </div>
    </div>
  );
}
