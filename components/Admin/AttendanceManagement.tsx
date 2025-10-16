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
  BarChart3
} from 'lucide-react';
import { AttendanceRecord, AttendanceSummary, AttendanceSettings } from '@/lib/attendanceTracking';
import { getAttendanceRecords, getAttendanceSettings, getAllEmployees } from '@/lib/database';
import { TimeFormat } from '@/lib/timeFormat';

interface AttendanceManagementProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function AttendanceManagement({ isOpen, onClose }: AttendanceManagementProps) {
  const [employees, setEmployees] = useState<EmployeeAttendanceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'late' | 'half_day'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const loadEmployeeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all employees
      const allEmployees = await getAllEmployees();
      
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
        allEmployees.map(async (employee) => {
          try {
            const [currentAttendance, summary, settings] = await Promise.all([
              getAttendanceRecords(employee.id, new Date(), new Date()).then(records => records[0] || null),
              getAttendanceRecords(employee.id, startDate, endDate).then(async (records) => {
                if (records.length === 0) return null;
                
                const totalWorkingDays = records.length;
                const presentDays = records.filter(r => r.status === 'present' || r.status === 'late').length;
                const absentDays = records.filter(r => r.status === 'absent').length;
                const lateDays = records.filter(r => r.status === 'late').length;
                const halfDays = records.filter(r => r.status === 'half_day').length;
                
                const totalWorkingHours = records.reduce((sum, r) => sum + r.totalWorkingHours, 0);
                const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
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
              getAttendanceSettings(employee.id)
            ]);

            return {
              employee,
              currentAttendance,
              summary,
              settings,
            };
          } catch (error) {
            console.error(`Error loading data for employee ${employee.id}:`, error);
            return {
              employee,
              currentAttendance: null,
              summary: null,
              settings: null,
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
    if (isOpen) {
      loadEmployeeData();
    }
  }, [isOpen, loadEmployeeData]);

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
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'half_day':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
      'Working Hours': emp.currentAttendance?.totalWorkingHours ? TimeFormat.formatHours(emp.currentAttendance.totalWorkingHours) : 'N/A',
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Attendance Management
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'present' | 'absent' | 'late' | 'half_day')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'present').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-400">Present Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'absent').length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-400">Absent Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredEmployees.filter(emp => emp.currentAttendance?.status === 'late').length}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">Late Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredEmployees.length > 0 ? 
                    Math.round(filteredEmployees.reduce((sum, emp) => sum + (emp.summary?.attendanceRate || 0), 0) / filteredEmployees.length) : 0}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">Avg Attendance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {filteredEmployees.map((emp) => (
            <div key={emp.employee.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {emp.employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {emp.employee.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {emp.employee.email}
                      {emp.employee.department && ` • ${emp.employee.department}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Current Status */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      {emp.currentAttendance && getStatusIcon(emp.currentAttendance.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.currentAttendance?.status || 'absent')}`}>
                        {emp.currentAttendance?.status?.replace('_', ' ').toUpperCase() || 'NOT TRACKED'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {emp.currentAttendance?.punchInTime ? 
                        `${formatTime(emp.currentAttendance.punchInTime)} - ${formatTime(emp.currentAttendance.punchOutTime)}` :
                        'No attendance today'
                      }
                    </div>
                  </div>

                  {/* Summary Stats */}
                  {emp.summary && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(emp.summary.attendanceRate)}% / {emp.summary.punctualityScore}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Attendance / Punctuality
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetails(showDetails === emp.employee.id ? null : emp.employee.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed View */}
              {showDetails === emp.employee.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Day Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Today&apos;s Details</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Punch In:</span>
                          <span className="ml-2">{formatTime(emp.currentAttendance?.punchInTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Punch Out:</span>
                          <span className="ml-2">{formatTime(emp.currentAttendance?.punchOutTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Working Hours:</span>
                          <span className="ml-2">
                            {emp.currentAttendance?.totalWorkingHours ? 
                              TimeFormat.formatHours(emp.currentAttendance.totalWorkingHours) : 
                              'N/A'
                            }
                          </span>
                        </div>
                        {emp.currentAttendance?.lateMinutes && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Late by:</span>
                            <span className="ml-2 text-yellow-600">{emp.currentAttendance.lateMinutes} min</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Period Summary */}
                    {emp.summary && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Period Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Present Days:</span>
                            <span className="ml-2">{emp.summary.presentDays}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Absent Days:</span>
                            <span className="ml-2">{emp.summary.absentDays}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Late Days:</span>
                            <span className="ml-2">{emp.summary.lateDays}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Total Hours:</span>
                            <span className="ml-2">{TimeFormat.formatHours(emp.summary.totalWorkingHours)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Settings */}
                    {emp.settings && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Work Schedule</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Work Hours:</span>
                            <span className="ml-2">{emp.settings.workStartTime} - {emp.settings.workEndTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Break Duration:</span>
                            <span className="ml-2">{emp.settings.breakDuration} min</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Late Threshold:</span>
                            <span className="ml-2">{emp.settings.lateThreshold} min</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Working Days:</span>
                            <span className="ml-2">{emp.settings.workingDays.length} days/week</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No employees found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
