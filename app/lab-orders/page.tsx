'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TestTube, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  ArrowLeft
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

export default function LabOrdersPage() {
  const { user } = useAuth();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'ordered' | 'in-progress' | 'completed' | 'follow-up'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLabOrders = async (status?: string) => {
    setLoading(true);
    try {
      let url = '/api/lab-orders';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      } else if (status === 'follow-up') {
        url += '?followUp=true';
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch lab orders');
      const data = await response.json();
      setLabOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders(activeTab);
  }, [activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ordered':
        return <TestTube className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'abnormal':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'normal':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const filteredLabOrders = labOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.labOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.doctorId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTabCounts = () => {
    const counts = {
      all: labOrders.length,
      ordered: labOrders.filter(o => o.status === 'ordered').length,
      'in-progress': labOrders.filter(o => o.status === 'in-progress').length,
      completed: labOrders.filter(o => o.status === 'completed').length,
      'follow-up': labOrders.filter(o => o.followUpRequired && o.followUpDate && new Date(o.followUpDate) <= new Date()).length
    };
    return counts;
  };

  const tabCounts = getTabCounts();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Go back to dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Lab Orders Management</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All Orders', icon: TestTube },
              { id: 'ordered', label: 'Ordered', icon: Clock },
              { id: 'in-progress', label: 'In Progress', icon: Edit },
              { id: 'completed', label: 'Completed', icon: CheckCircle },
              { id: 'follow-up', label: 'Follow-up', icon: AlertCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'pending' | 'in-progress' | 'completed')}
                  className={`flex items-center px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 shadow-[0_-2px_0_0_#3b82f6_inset]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tabCounts[tab.id as keyof typeof tabCounts]}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by lab order ID, patient ID, or doctor ID..."
                  className="w-full pl-10 pr-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 shadow-sm text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Lab Orders List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Lab Orders ({filteredLabOrders.length})
            </h3>
          </div>
          <div className="space-y-1">
            {filteredLabOrders.map((order, index) => (
              <div key={order.id || order.labOrderId || `lab-order-${index}`} className="p-6 hover:bg-gray-50 shadow-sm rounded-lg mx-2 my-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {order.labOrderId}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Patient: {order.patientId}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Doctor: {order.doctorId}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Ordered: {formatDate(order.orderedDate)}
                        </div>
                        {order.completedDate && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed: {formatDate(order.completedDate)}
                          </div>
                        )}
                      </div>
                      
                      {/* Test Results Summary */}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Tests:</span>
                        {order.tests.map((test, testIndex) => (
                          <span
                            key={test.testCode || test.testName || `test-${testIndex}`}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shadow-sm bg-gray-100 text-gray-800"
                          >
                            {getTestStatusIcon(test.status)}
                            <span className="ml-1">{test.testName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/lab-orders/${order.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    {order.status === 'ordered' && (
                      <Link
                        href={`/lab-orders/${order.id}/results`}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Enter Results
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLabOrders.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lab orders found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'No lab orders match your search criteria. Try a different search term.'
                : 'No lab orders available for the selected status.'
              }
            </p>
            <Link
              href="/lab-orders/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Lab Order
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}