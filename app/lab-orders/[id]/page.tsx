'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TestTube, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Download,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface LabOrder {
  id: string;
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
  updatedAt: string;
}

export default function LabOrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [labOrder, setLabOrder] = useState<LabOrder | null>(null);

  const fetchLabOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lab-orders?id=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch lab order');
      const data = await response.json();
      setLabOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchLabOrder();
  }, [params.id, fetchLabOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'abnormal':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading lab order...</div>
      </div>
    );
  }

  if (!labOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lab Order Not Found</h1>
          <p className="text-gray-600">The requested lab order could not be found.</p>
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
                href="/lab-orders"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Lab Order Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              {labOrder.status === 'ordered' && (
                <Link
                  href={`/lab-orders/${labOrder.id}/results`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Enter Results
                </Link>
              )}
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lab Order Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{labOrder.labOrderId}</h2>
              <p className="text-sm text-gray-600">Lab Order Details</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(labOrder.status)}`}>
              {labOrder.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient ID: {labOrder.patientId}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Doctor: {labOrder.doctorId}
                </div>
                {labOrder.appointmentId && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointment: {labOrder.appointmentId}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ordered: {formatDate(labOrder.orderedDate)}
                </div>
                {labOrder.completedDate && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed: {formatDate(labOrder.completedDate)}
                  </div>
                )}
                {labOrder.labTechnician && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Technician: {labOrder.labTechnician}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Created: {formatDateTime(labOrder.createdAt)}</div>
                <div>Updated: {formatDateTime(labOrder.updatedAt)}</div>
                {labOrder.followUpRequired && labOrder.followUpDate && (
                  <div className="flex items-center text-yellow-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Follow-up: {formatDate(labOrder.followUpDate)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {labOrder.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{labOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            <p className="text-sm text-gray-600 mt-1">
              {labOrder.tests.length} test{labOrder.tests.length !== 1 ? 's' : ''} ordered
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {labOrder.tests.map((test, index) => (
                <div key={index} className={`p-4 border-2 rounded-lg ${getStatusColor(test.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{test.testName}</h3>
                        <p className="text-sm text-gray-600">
                          Code: {test.testCode}
                          {test.normalRange && ` • Normal Range: ${test.normalRange}`}
                          {test.unit && ` • Unit: ${test.unit}`}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      test.status === 'critical' ? 'bg-red-100 text-red-800' :
                      test.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                      test.status === 'normal' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  
                  {test.value && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Result: </span>
                      <span className="text-sm text-gray-900 font-mono">
                        {test.value} {test.unit}
                      </span>
                    </div>
                  )}
                  
                  {test.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes: </span>
                      {test.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{labOrder.tests.length}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {labOrder.tests.filter(t => t.status === 'normal').length}
              </div>
              <div className="text-sm text-green-600">Normal</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {labOrder.tests.filter(t => t.status === 'abnormal').length}
              </div>
              <div className="text-sm text-yellow-600">Abnormal</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {labOrder.tests.filter(t => t.status === 'critical').length}
              </div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
          </div>
        </div>

        {/* Follow-up Alert */}
        {labOrder.followUpRequired && labOrder.followUpDate && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="font-medium text-yellow-800">Follow-up Required</h3>
                <p className="text-sm text-yellow-700">
                  This lab order requires follow-up by {formatDate(labOrder.followUpDate)}.
                  {new Date(labOrder.followUpDate) <= new Date() && (
                    <span className="font-medium"> (Overdue)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
