'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AuditLog {
  id: string;
  logId: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  success: boolean;
  errorMessage?: string;
}

export default function AuditLogsPage() {
  const { user, employee } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    success: '',
    dateRange: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchAuditLogs();
    }
  }, [user, employee]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Mock data - in production, this would fetch from your API
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          logId: 'LOG-001',
          userId: 'user-123',
          userRole: 'doctor',
          action: 'create_prescription',
          resource: 'prescription',
          resourceId: 'RX-001',
          details: { patientId: 'PAT-001', medications: ['Metformin'] },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date().toISOString(),
          severity: 'low',
          category: 'prescription',
          success: true,
        },
        {
          id: '2',
          logId: 'LOG-002',
          userId: 'user-456',
          userRole: 'receptionist',
          action: 'login',
          resource: 'authentication',
          details: {},
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'low',
          category: 'authentication',
          success: true,
        },
        {
          id: '3',
          logId: 'LOG-003',
          userId: 'user-789',
          userRole: 'admin',
          action: 'delete_patient',
          resource: 'patient',
          resourceId: 'PAT-002',
          details: { patientName: 'John Doe' },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'high',
          category: 'patient',
          success: true,
        },
      ];

      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      case 'appointment':
        return 'bg-purple-100 text-purple-800';
      case 'prescription':
        return 'bg-yellow-100 text-yellow-800';
      case 'billing':
        return 'bg-indigo-100 text-indigo-800';
      case 'lab':
        return 'bg-pink-100 text-pink-800';
      case 'queue':
        return 'bg-cyan-100 text-cyan-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filters.category || log.category === filters.category;
    const matchesSeverity = !filters.severity || log.severity === filters.severity;
    const matchesSuccess = !filters.success || 
      (filters.success === 'success' && log.success) ||
      (filters.success === 'failure' && !log.success);

    return matchesSearch && matchesCategory && matchesSeverity && matchesSuccess;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User Role', 'Action', 'Resource', 'Resource ID', 'Severity', 'Category', 'Success', 'IP Address'],
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        log.userRole,
        log.action,
        log.resource,
        log.resourceId || '',
        log.severity,
        log.category,
        log.success ? 'Yes' : 'No',
        log.ipAddress || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            </div>
            <button
              onClick={exportLogs}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
            >
              <option value="">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="patient">Patient</option>
              <option value="appointment">Appointment</option>
              <option value="prescription">Prescription</option>
              <option value="billing">Billing</option>
              <option value="lab">Lab</option>
              <option value="queue">Queue</option>
              <option value="system">System</option>
              <option value="security">Security</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.success}
              onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
              className="px-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
            >
              <option value="">All Results</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
            <button
              onClick={() => setFilters({ category: '', severity: '', success: '', dateRange: '' })}
              className="px-4 py-2 shadow-sm rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-medium text-gray-900">
              Audit Logs ({filteredLogs.length} entries)
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading audit logs...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600">{error}</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-500">No logs match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userRole}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                        {log.resourceId && (
                          <span className="text-gray-500 ml-1">({log.resourceId})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                          <span className="ml-1">{log.severity}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.logId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Role</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.resourceId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 truncate">{selectedLog.userAgent || 'N/A'}</p>
                  </div>
                </div>
                
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.errorMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="mt-1 text-sm text-red-600">{selectedLog.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
