'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TestTube, Plus, Search, Eye, Clock, CheckCircle, AlertCircle, XCircle, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface LabOrder {
  _id: string;
  labOrderId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  tests: {
    testName: string;
    testCode: string;
    normalRange?: string;
    unit?: string;
    value?: string | number;
    status: 'pending' | 'normal' | 'abnormal' | 'critical';
    notes?: string;
  }[];
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  orderedDate: string;
  completedDate?: string;
  labTechnician?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
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

export default function AdminLabOrdersPage() {
  const { user, employee } = useAuth();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);
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

      const [labOrdersRes, patientsRes, usersRes] = await Promise.allSettled([
        fetch('/api/lab-orders'),
        fetch('/api/patients'),
        fetch('/api/auth/user?all=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [labOrdersData, patientsData, usersData] = await Promise.all([
        labOrdersRes.status === 'fulfilled' ? labOrdersRes.value.json() : Promise.resolve([]),
        patientsRes.status === 'fulfilled' ? patientsRes.value.json() : Promise.resolve([]),
        usersRes.status === 'fulfilled' ? usersRes.value.json() : Promise.resolve([])
      ]);

      let filteredOrders = Array.isArray(labOrdersData) ? labOrdersData : [];
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((o: LabOrder) => o.status === statusFilter);
      }
      setLabOrders(filteredOrders);

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
      console.error('Error loading lab orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'abnormal': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLabOrders = labOrders.filter(order => {
    const patient = patients[order.patientId];
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = 
      order.labOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tests.some(test => 
        test.testName.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Lab Orders Management</h1>
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
                href="/lab-orders/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Lab Order
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lab orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ordered">Ordered</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Lab Orders Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Lab Orders ({filteredLabOrders.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading lab orders...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600">{error}</div>
            </div>
          ) : filteredLabOrders.length === 0 ? (
            <div className="p-8 text-center">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lab orders found</h3>
              <p className="text-gray-500">No lab orders match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLabOrders.map((order) => {
                    const patient = patients[order.patientId];
                    const doctor = doctors[order.doctorId];
                    
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.labOrderId}</div>
                          {order.followUpRequired && (
                            <div className="text-xs text-yellow-600">Follow-up required</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doctor ? doctor.name : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.tests.length} test(s)
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.tests.map(t => t.testName).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.orderedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedLabOrder(order);
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

      {/* Lab Order Details Modal */}
      {showDetails && selectedLabOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lab Order Details</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLabOrder.labOrderId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLabOrder.status)}`}>
                        {selectedLabOrder.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patients[selectedLabOrder.patientId] 
                        ? `${patients[selectedLabOrder.patientId].firstName} ${patients[selectedLabOrder.patientId].lastName}`
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {doctors[selectedLabOrder.doctorId]?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ordered Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLabOrder.orderedDate)}</p>
                  </div>
                  {selectedLabOrder.completedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLabOrder.completedDate)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tests</label>
                  <div className="space-y-2">
                    {selectedLabOrder.tests.map((test, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{test.testName}</p>
                            <p className="text-xs text-gray-600">Code: {test.testCode}</p>
                            {test.value !== undefined && (
                              <p className="text-sm text-gray-900 mt-1">
                                Result: {test.value} {test.unit || ''}
                              </p>
                            )}
                            {test.normalRange && (
                              <p className="text-xs text-gray-500">Normal Range: {test.normalRange}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTestStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                        {test.notes && (
                          <p className="text-xs text-gray-500 mt-2">{test.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedLabOrder.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <p className="text-sm text-gray-900">{selectedLabOrder.notes}</p>
                  </div>
                )}

                {selectedLabOrder.followUpRequired && selectedLabOrder.followUpDate && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm font-medium text-yellow-800">Follow-up Required</p>
                    <p className="text-sm text-yellow-700">Date: {formatDate(selectedLabOrder.followUpDate)}</p>
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

