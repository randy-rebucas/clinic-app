'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Phone,
  FileText,
  Search
} from 'lucide-react';

interface Prescription {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  medications: {
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  prescribedDate: string;
  deliveryDate?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  assignedMedRep?: string;
}

interface Delivery {
  id: string;
  prescriptionId: string;
  patientName: string;
  patientPhone: string;
  deliveryAddress: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'failed';
  scheduledTime: string;
  actualDeliveryTime?: string;
  notes?: string;
  medRepId: string;
}

export default function MedRepDashboard() {
  const { employee } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'deliveries' | 'map' | 'completed' | 'pending'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (employee?.role === 'medrep') {
      fetchMedRepData();
    }
  }, [employee]);

  const fetchMedRepData = async () => {
    setLoading(true);
    try {
      // Fetch prescriptions assigned to this medrep
      const prescriptionsResponse = await fetch('/api/prescriptions?medrep=true');
      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(prescriptionsData);
      }

      // Fetch deliveries for this medrep
      const deliveriesResponse = await fetch('/api/deliveries');
      if (deliveriesResponse.ok) {
        const deliveriesData = await deliveriesResponse.json();
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error('Error fetching medrep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (prescriptionId: string, status: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchMedRepData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating prescription status:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        fetchMedRepData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'out-for-delivery':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
      case 'in-transit':
        return <Package className="h-4 w-4" />;
      case 'ready':
      case 'out-for-delivery':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (employee?.role !== 'medrep') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to Medical Representatives.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MedRep Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {employee?.name}
                </p>
                <p className="text-sm text-gray-600">Medical Representative</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deliveries Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => 
                    new Date(d.scheduledTime).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => 
                    d.status === 'delivered' && 
                    new Date(d.actualDeliveryTime || d.scheduledTime).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search prescriptions or deliveries..."
                />
              </div>
            </div>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
                { id: 'deliveries', label: 'Deliveries', icon: Truck },
                { id: 'map', label: 'Delivery Map', icon: MapPin }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'deliveries' | 'completed' | 'pending')}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{prescription.prescriptionId}</h4>
                      <p className="text-sm text-gray-600">
                        Patient: {prescription.patientName} • {formatDate(prescription.prescribedDate)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                      {getStatusIcon(prescription.status)}
                      <span className="ml-1">{prescription.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Medications</h5>
                      <div className="space-y-1">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {med.name} - {med.dosage} (Qty: {med.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Delivery Info</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {prescription.patientName}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {prescription.patientPhone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {prescription.deliveryAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {prescription.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updatePrescriptionStatus(prescription.id, 'confirmed')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updatePrescriptionStatus(prescription.id, 'cancelled')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {prescription.status === 'confirmed' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updatePrescriptionStatus(prescription.id, 'preparing')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Start Preparing
                      </button>
                    </div>
                  )}
                  
                  {prescription.status === 'preparing' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updatePrescriptionStatus(prescription.id, 'ready')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Mark Ready
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Deliveries</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{delivery.prescriptionId}</h4>
                      <p className="text-sm text-gray-600">
                        Patient: {delivery.patientName} • Scheduled: {formatDateTime(delivery.scheduledTime)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1">{delivery.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contact Info</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {delivery.patientName}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {delivery.patientPhone}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Delivery Address</h5>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {delivery.deliveryAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {delivery.notes && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                      <p className="text-sm text-gray-600">{delivery.notes}</p>
                    </div>
                  )}
                  
                  {delivery.status === 'scheduled' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'in-transit')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Start Delivery
                      </button>
                    </div>
                  )}
                  
                  {delivery.status === 'in-transit' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'failed')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Mark Failed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Map</h3>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Map integration would go here</p>
                <p className="text-sm text-gray-500">Integrate with Google Maps or similar service</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
}
