'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Download, 
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Mail
} from 'lucide-react';
import { AttendanceRecord, AttendanceSummary, AttendanceSettings } from '@/lib/attendanceTracking';
// Removed direct database imports - now using API routes
import { TimeFormat } from '@/lib/timeFormat';

// API helper functions
const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const getAttendanceRecords = async (employeeId: string, startDate: Date, endDate: Date) => {
  try {
    const params = new URLSearchParams({
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    return await apiCall(`/api/attendance/records?${params}`);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
};

const getAttendanceSettings = async (employeeId: string) => {
  try {
    const params = new URLSearchParams({ employeeId });
    return await apiCall(`/api/attendance/settings?${params}`);
  } catch (error) {
    console.error('Error fetching attendance settings:', error);
    return null;
  }
};

interface AttendanceManagementProps {
  // No props needed for page component
}

interface EmployeeAttendanceData {
  employee: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  currentAttendance?: AttendanceRecord;
  summary?: AttendanceSummary;
  settings?: AttendanceSettings;
}

export default function AttendanceManagement({}: AttendanceManagementProps) {
  const [employees, setEmployees] = useState<EmployeeAttendanceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'late' | 'half_day'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const loadEmployeeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all employees via API
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      const allEmployees = data.data;
      
      // Get current date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'year':
          startDate.setDate(endDate.getDate() - 365);
          break;
      }

      // Load attendance data for each employee
      const employeeData: EmployeeAttendanceData[] = await Promise.all(
        allEmployees.map(async (employee: { 
          _id: { toString(): string }; 
          id: string;
          name: string;
          email: string;
          department?: string;
        }) => {
          try {
            const [currentAttendance, summary, settings] = await Promise.all([
              getAttendanceRecords(employee._id.toString(), new Date(), new Date()).then(records => {
                const record = records[0];
                if (!record) return undefined;
                return {
                  id: record._id.toString(),
                  employeeId: record.employeeId.toString(),
                  date: record.date,
                  punchInTime: record.punchInTime,
                  punchOutTime: record.punchOutTime,
                  totalWorkingHours: record.totalWorkingHours,
                  totalBreakTime: record.totalBreakTime,
                  status: record.status
                } as AttendanceRecord;
              }),
              getAttendanceRecords(employee._id.toString(), startDate, endDate).then(async (records) => {
                if (records.length === 0) return undefined;
                
                const totalWorkingDays = records.length;
                const presentDays = records.filter((r: any) => r.status === 'present' || r.status === 'late').length;
                const absentDays = records.filter((r: any) => r.status === 'absent').length;
                const lateDays = records.filter((r: any) => r.status === 'late').length;
                const halfDays = records.filter((r: any) => r.status === 'half_day').length;
                
                const totalWorkingHours = records.reduce((sum: number, r: any) => sum + r.totalWorkingHours, 0);
                const totalOvertimeHours = records.reduce((sum: number, r: any) => sum + (r.overtimeHours || 0), 0);
                const averageWorkingHours = records.length > 0 ? totalWorkingHours / records.length : 0;
                
                const punctualityScore = presentDays > 0 ? 
                  Math.round((presentDays - lateDays) / presentDays * 100) : 0;
                const attendanceRate = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

                return {
                  employeeId: employee.id,
                  period: { startDate, endDate },
                  totalWorkingDays,
                  presentDays,
                  absentDays,
                  lateDays,
                  halfDays,
                  totalWorkingHours,
                  totalOvertimeHours,
                  averageWorkingHours,
                  punctualityScore,
                  attendanceRate,
                } as AttendanceSummary;
              }),
              getAttendanceSettings(employee._id.toString()).then(settings => {
                if (!settings) return undefined;
                return {
                  id: settings._id?.toString() || settings.id || 'default',
                  employeeId: settings.employeeId?.toString() || employee._id.toString(),
                  workStartTime: settings.workStartTime,
                  workEndTime: settings.workEndTime,
                  breakDuration: settings.breakDuration,
                  lateThreshold: settings.lateThreshold,
                  earlyLeaveThreshold: settings.earlyLeaveThreshold,
                  overtimeThreshold: settings.overtimeThreshold,
                  workingDays: settings.workingDays,
                  timezone: settings.timezone,
                  requireLocation: settings.requireLocation,
                  allowRemoteWork: settings.allowRemoteWork,
                  autoPunchOut: settings.autoPunchOut
                } as AttendanceSettings;
              })
            ]);

            return {
              employee: {
                id: employee._id.toString(),
                name: employee.name,
                email: employee.email,
                department: employee.department
              },
              currentAttendance,
              summary,
              settings,
            };
          } catch (error) {
            console.error(`Error loading data for employee ${employee._id.toString()}:`, error);
            return {
              employee: {
                id: employee._id.toString(),
                name: employee.name,
                email: employee.email,
                department: employee.department
              },
              currentAttendance: undefined,
              summary: undefined,
              settings: undefined,
            };
          }
        })
      );

      setEmployees(employeeData);
    } catch (error) {
      console.error('Error loading employee attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'all') return true;
    
    const currentStatus = emp.currentAttendance?.status;
    return currentStatus === filterStatus;
  });

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'late':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'half_day':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'on_leave':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half_day':
        return 'bg-orange-100 text-orange-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const exportAttendanceReport = () => {
    const csvData = filteredEmployees.map(emp => ({
      'Employee Name': emp.employee.name,
      'Email': emp.employee.email,
      'Department': emp.employee.department || 'N/A',
      'Current Status': emp.currentAttendance?.status || 'Not Available',
      'Punch In': emp.currentAttendance?.punchInTime ? formatTime(emp.currentAttendance.punchInTime) : 'N/A',
      'Punch Out': emp.currentAttendance?.punchOutTime ? formatTime(emp.currentAttendance.punchOutTime) : 'N/A',
      'Working Hours': emp.currentAttendance?.totalWorkingHours ? TimeFormat.formatDuration(emp.currentAttendance.totalWorkingHours * 60) : 'N/A',
      'Attendance Rate': emp.summary ? `${Math.round(emp.summary.attendanceRate)}%` : 'N/A',
      'Punctuality Score': emp.summary ? `${emp.summary.punctualityScore}%` : 'N/A',
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'present' | 'absent' | 'late' | 'half_day')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
          
          <button
            onClick={exportAttendanceReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'present').length}
                </div>
                <div className="text-sm text-green-700">Present Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'absent').length}
                </div>
                <div className="text-sm text-red-700 text-red-400">Absent Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'late').length}
                </div>
                <div className="text-sm text-yellow-700 text-yellow-400">Late Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredEmployees.length > 0 ? 
                    Math.round(filteredEmployees.reduce((sum, emp) => sum + (emp.summary?.attendanceRate || 0), 0) / filteredEmployees.length) : 0}%
                </div>
                <div className="text-sm text-blue-700 text-blue-400">Avg Attendance</div>
              </div>
            </div>
          </div>
        </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punch In/Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Working Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((emp) => (
              <tr key={emp.employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {emp.employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{emp.employee.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {emp.employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {emp.currentAttendance?.status ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emp.currentAttendance.status)}`}>
                      {getStatusIcon(emp.currentAttendance.status)}
                      {emp.currentAttendance.status.replace('_', ' ').toUpperCase()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Clock className="h-3 w-3 mr-1" />
                      NOT TRACKED
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>In: {formatTime(emp.currentAttendance?.punchInTime)}</div>
                    <div>Out: {formatTime(emp.currentAttendance?.punchOutTime)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {emp.currentAttendance?.totalWorkingHours?.toFixed(1) || '0.0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {emp.summary ? (
                    <div>
                      <div>{emp.summary.attendanceRate.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">Punctuality: {emp.summary.punctualityScore.toFixed(0)}%</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No data</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowDetails(showDetails === emp.employee.id ? null : emp.employee.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees found matching your criteria.
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const emp = filteredEmployees.find(e => e.employee.id === showDetails);
              if (!emp) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Today&apos;s Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Punch In:</span>
                        <span>{formatTime(emp.currentAttendance?.punchInTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Punch Out:</span>
                        <span>{formatTime(emp.currentAttendance?.punchOutTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Working Hours:</span>
                        <span>{emp.currentAttendance?.totalWorkingHours?.toFixed(1) || '0.0'}h</span>
                      </div>
                    </div>
                  </div>

                  {emp.summary && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Period Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Present Days:</span>
                          <span>{emp.summary.presentDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Absent Days:</span>
                          <span>{emp.summary.absentDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Late Days:</span>
                          <span>{emp.summary.lateDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Hours:</span>
                          <span>{emp.summary.totalWorkingHours.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
