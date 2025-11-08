'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, Plus, Search, User, Clock, CheckCircle, XCircle, Play, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  _id: string;
  queueId: string;
  patientId: string;
  appointmentId?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  assignedDoctorId?: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  estimatedWaitTime?: number;
  actualWaitTime?: number;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Doctor {
  _id: string;
  name: string;
}

export default function AdminQueuePage() {
  const { user, employee } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchData();
    }
  }, [user, employee, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const [queueRes, patientsRes, usersRes] = await Promise.allSettled([
        fetch('/api/queue'),
        fetch('/api/patients'),
        fetch('/api/auth/user?all=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [queueData, patientsData, usersData] = await Promise.all([
        queueRes.status === 'fulfilled' ? queueRes.value.json() : Promise.resolve([]),
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        usersRes.status === 'fulfilled' ? usersRes.value.json() : Promise.resolve([])
      ]);

      let filteredQueue = Array.isArray(queueData) ? queueData : [];
      if (statusFilter !== 'all') {
        filteredQueue = filteredQueue.filter((q: QueueItem) => q.status === statusFilter);
      }
      setQueueItems(filteredQueue);

      // Create patient lookup
      const patientMap: Record<string, Patient> = {};
      if (Array.isArray(patientsData)) {
        patientsData.forEach((p: any) => {
          patientMap[p._id] = { _id: p._id, firstName: p.firstName, lastName: p.lastName };
        });
      }
      setPatients(patientMap);

      // Create doctor lookup
      const doctorMap: Record<string, Doctor> = {};
      if (Array.isArray(usersData)) {
        usersData.filter((u: any) => u.role === 'doctor').forEach((d: any) => {
          doctorMap[d._id] = { _id: d._id, name: d.name };
        });
      }
      setDoctors(doctorMap);
    } catch (err) {
      console.error('Error loading queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQueueItems = queueItems.filter(item => {
    const patient = patients[item.patientId];
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = 
      item.queueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
              <ClipboardList className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/queue/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{queueItems.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(q => q.status === 'waiting').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(q => q.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(q => q.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Queue ({filteredQueueItems.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading queue...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600">{error}</div>
            </div>
          ) : filteredQueueItems.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No queue items found</h3>
              <p className="text-gray-500">No queue items match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queue ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQueueItems.map((item) => {
                    const patient = patients[item.patientId];
                    const doctor = doctors[item.assignedDoctorId || ''];
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.queueId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">{item.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doctor ? doctor.name : item.assignedDoctorId ? 'Unknown' : 'Unassigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.estimatedWaitTime ? `${item.estimatedWaitTime} min` : 'N/A'}
                          </div>
                          {item.actualWaitTime && (
                            <div className="text-xs text-gray-500">
                              Actual: {item.actualWaitTime} min
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedQueueItem(item);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Queue Item Details Modal */}
      {showDetails && selectedQueueItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Queue Item Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Queue ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQueueItem.queueId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQueueItem.status)}`}>
                        {selectedQueueItem.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patients[selectedQueueItem.patientId] 
                        ? `${patients[selectedQueueItem.patientId].firstName} ${patients[selectedQueueItem.patientId].lastName}`
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedQueueItem.priority)}`}>
                        {selectedQueueItem.priority}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedQueueItem.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {doctors[selectedQueueItem.assignedDoctorId || '']?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <p className="text-sm text-gray-900">{selectedQueueItem.reason}</p>
                </div>

                {selectedQueueItem.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <p className="text-sm text-gray-900">{selectedQueueItem.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedQueueItem.estimatedWaitTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Wait Time</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQueueItem.estimatedWaitTime} minutes</p>
                    </div>
                  )}
                  {selectedQueueItem.actualWaitTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Actual Wait Time</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQueueItem.actualWaitTime} minutes</p>
                    </div>
                  )}
                  {selectedQueueItem.calledAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Called At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedQueueItem.calledAt)} {formatTime(selectedQueueItem.calledAt)}
                      </p>
                    </div>
                  )}
                  {selectedQueueItem.startedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Started At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedQueueItem.startedAt)} {formatTime(selectedQueueItem.startedAt)}
                      </p>
                    </div>
                  )}
                  {selectedQueueItem.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedQueueItem.completedAt)} {formatTime(selectedQueueItem.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

