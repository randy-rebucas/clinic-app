'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  FileText, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  pendingDeliveries: number;
  inTransit: number;
  completedToday: number;
  totalDeliveries: number;
  pendingPrescriptions: number;
  overdueDeliveries: number;
}

interface Delivery {
  _id: string;
  deliveryId: string;
  prescriptionId: string;
  patientName: string;
  status: string;
  deliveryDate?: string;
  estimatedDeliveryDate?: string;
}

interface Prescription {
  _id: string;
  prescriptionId: string;
  patientId: string;
  status: string;
  prescribedDate: string;
}

export default function MedRepDashboard() {
  const { user, employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingDeliveries: 0,
    inTransit: 0,
    completedToday: 0,
    totalDeliveries: 0,
    pendingPrescriptions: 0,
    overdueDeliveries: 0,
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && employee?.role === 'medrep') {
      fetchDashboardData();
    }
  }, [user, employee]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];

      const token = localStorage.getItem('token');
      const [deliveriesRes, prescriptionsRes] = await Promise.allSettled([
        fetch('/api/deliveries', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/prescriptions')
      ]);

      const [deliveriesData, prescriptionsData] = await Promise.all([
        deliveriesRes.status === 'fulfilled' ? deliveriesRes.value.json() : Promise.resolve([]),
        prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.json() : Promise.resolve([])
      ]);

      const allDeliveries = Array.isArray(deliveriesData) ? deliveriesData : [];
      const allPrescriptions = Array.isArray(prescriptionsData) ? prescriptionsData : [];

      // Filter medrep-specific data
      const myDeliveries = allDeliveries.filter((d: any) => d.medRepId === employee?.id);
      const pendingDeliveries = myDeliveries.filter((d: any) => d.status === 'pending');
      const inTransit = myDeliveries.filter((d: any) => d.status === 'in-transit');
      const completedToday = myDeliveries.filter((d: any) => 
        d.status === 'delivered' && d.deliveryDate?.startsWith(today)
      );
      const overdueDeliveries = myDeliveries.filter((d: any) => 
        d.status !== 'delivered' && 
        d.estimatedDeliveryDate && 
        new Date(d.estimatedDeliveryDate) < new Date()
      );

      const pendingPrescriptions = allPrescriptions.filter((p: any) => 
        p.status === 'approved' && !myDeliveries.some((d: any) => d.prescriptionId === p._id)
      );

      setStats({
        pendingDeliveries: pendingDeliveries.length,
        inTransit: inTransit.length,
        completedToday: completedToday.length,
        totalDeliveries: myDeliveries.length,
        pendingPrescriptions: pendingPrescriptions.length,
        overdueDeliveries: overdueDeliveries.length,
      });

      setDeliveries([...pendingDeliveries, ...inTransit].slice(0, 5));
      setPrescriptions(pendingPrescriptions.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || employee?.role !== 'medrep') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to medical representatives.</p>
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
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical Representative Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {employee?.name}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueDeliveries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/deliveries" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-yellow-600 mr-3" />
              <span className="font-medium text-gray-900">View Deliveries</span>
            </div>
          </Link>
          <Link href="/prescriptions" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Prescriptions</span>
            </div>
          </Link>
          <Link href="/deliveries/new" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">New Delivery</span>
            </div>
          </Link>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Active Deliveries</h3>
            <Link href="/deliveries" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No active deliveries</div>
            ) : (
              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <div key={delivery._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{delivery.patientName}</p>
                      <p className="text-sm text-gray-500">Delivery ID: {delivery.deliveryId}</p>
                      {delivery.estimatedDeliveryDate && (
                        <p className="text-xs text-gray-400">Est: {formatDate(delivery.estimatedDeliveryDate)}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Prescriptions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Prescriptions</h3>
            <Link href="/prescriptions" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending prescriptions</div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Prescription ID: {prescription.prescriptionId}</p>
                      <p className="text-sm text-gray-500">Prescribed: {formatDate(prescription.prescribedDate)}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      {prescription.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

