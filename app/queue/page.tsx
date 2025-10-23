'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  UserPlus,
  Bell,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  queueId: string;
  patientId: string;
  appointmentId?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  assignedDoctorId?: string;
  status: 'waiting' | 'called' | 'in-progress' | 'completed' | 'cancelled';
  estimatedWaitTime?: number;
  actualWaitTime?: number;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  averageWaitTime: number;
}

export default function QueuePage() {
  const { user, employee } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const fetchQueue = async (status?: string) => {
    setLoading(true);
    try {
      let url = '/api/queue';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch queue');
      const data = await response.json();
      setQueueItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/queue?stats=true');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchQueue(activeTab);
    fetchStats();
  }, [activeTab]);

  const updateQueueStatus = async (queueId: string, status: string, assignedDoctorId?: string) => {
    try {
      const response = await fetch('/api/queue', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queueId,
          status,
          assignedDoctorId: assignedDoctorId || employee?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update queue status');
      }

      // Refresh queue data
      fetchQueue(activeTab);
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // const assignDoctor = async (queueId: string, doctorId: string) => {
  //   try {
  //     const response = await fetch('/api/queue', {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         queueId,
  //         doctorId
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to assign doctor');
  //     }

  //     // Refresh queue data
  //     fetchQueue(activeTab);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An error occurred');
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'called':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'called':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // const formatTime = (dateString: string) => {
  //   return new Date(dateString).toLocaleTimeString();
  // };

  // const formatDateTime = (dateString: string) => {
  //   return new Date(dateString).toLocaleString();
  // };

  const calculateWaitTime = (item: QueueItem) => {
    if (item.status === 'completed' && item.completedAt) {
      const start = new Date(item.createdAt);
      const end = new Date(item.completedAt);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    } else if (item.status === 'in-progress' && item.startedAt) {
      const start = new Date(item.createdAt);
      const end = new Date(item.startedAt);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    } else {
      const start = new Date(item.createdAt);
      const now = new Date();
      return Math.round((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
    }
  };

  const filteredQueueItems = queueItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.queueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDoctor = selectedDoctor === '' || 
      (selectedDoctor === 'unassigned' && !item.assignedDoctorId) ||
      item.assignedDoctorId === selectedDoctor;
    
    return matchesSearch && matchesDoctor;
  });

  const getTabCounts = () => {
    const counts = {
      all: queueItems.length,
      waiting: queueItems.filter(item => item.status === 'waiting').length,
      'in-progress': queueItems.filter(item => item.status === 'in-progress').length,
      completed: queueItems.filter(item => item.status === 'completed').length
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
              <ClipboardList className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total in Queue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All', icon: ClipboardList },
              { id: 'waiting', label: 'Waiting', icon: Clock },
              { id: 'in-progress', label: 'In Progress', icon: Play },
              { id: 'completed', label: 'Completed', icon: CheckCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'waiting' | 'in-progress' | 'completed')}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  placeholder="Search by queue ID, patient ID, or reason..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Doctors</option>
                <option value="unassigned">Unassigned</option>
                <option value="doctor1">Dr. Smith</option>
                <option value="doctor2">Dr. Johnson</option>
                <option value="doctor3">Dr. Williams</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Queue List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Queue ({filteredQueueItems.length})
            </h3>
          </div>
          <div className="space-y-1">
            {filteredQueueItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 shadow-sm rounded-lg mx-2 my-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.queueId}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Patient: {item.patientId}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Wait: {calculateWaitTime(item)} min
                        </div>
                        <div className="flex items-center">
                          <span className="capitalize">{item.type}</span>
                        </div>
                        {item.assignedDoctorId && (
                          <div className="flex items-center">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Dr. {item.assignedDoctorId}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Reason: {item.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'waiting' && (
                      <>
                        <button
                          onClick={() => updateQueueStatus(item.id, 'called')}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm flex items-center"
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Call
                        </button>
                        <button
                          onClick={() => updateQueueStatus(item.id, 'in-progress')}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </button>
                      </>
                    )}
                    {item.status === 'called' && (
                      <button
                        onClick={() => updateQueueStatus(item.id, 'in-progress')}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </button>
                    )}
                    {item.status === 'in-progress' && (
                      <button
                        onClick={() => updateQueueStatus(item.id, 'completed')}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </button>
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
        {!loading && filteredQueueItems.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No queue items found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'No queue items match your search criteria. Try a different search term.'
                : 'No queue items available for the selected status.'
              }
            </p>
            <Link
              href="/queue/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient to Queue
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}