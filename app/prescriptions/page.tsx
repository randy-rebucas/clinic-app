'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Search, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Prescription {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }>;
  diagnosis: string;
  notes?: string;
  status: 'pending' | 'approved' | 'dispensed' | 'delivered' | 'cancelled';
  prescribedDate: string;
  validUntil: string;
  deliveredBy?: string;
  deliveredDate?: string;
  createdAt: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions] = useState<Prescription[]>([]);
  // const [loading] = useState(false);
  const [error] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'dispensed':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.prescriptionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.medications.some(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const pendingPrescriptions = filteredPrescriptions.filter(p => p.status === 'pending');
  const approvedPrescriptions = filteredPrescriptions.filter(p => p.status === 'approved');
  const dispensedPrescriptions = filteredPrescriptions.filter(p => p.status === 'dispensed');
  const deliveredPrescriptions = filteredPrescriptions.filter(p => p.status === 'delivered');

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
            </div>
            <Link
              href="/prescriptions/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prescriptions by patient ID, prescription ID, diagnosis, or medication..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="dispensed">Dispensed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPrescriptions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedPrescriptions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dispensed</p>
                <p className="text-2xl font-bold text-gray-900">{dispensedPrescriptions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredPrescriptions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
          </div>
          
          {filteredPrescriptions.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No prescriptions match your search criteria.' : 'Get started by creating your first prescription.'}
              </p>
              <Link
                href="/prescriptions/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Prescription
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            Prescription {prescription.prescriptionId}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            <span className="ml-1">{prescription.status}</span>
                          </span>
                          {isExpired(prescription.validUntil) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Patient: {prescription.patientId}</span>
                          <span>Prescribed: {formatDate(prescription.prescribedDate)}</span>
                          <span>Valid until: {formatDate(prescription.validUntil)}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <strong>Medications:</strong> {prescription.medications.map(med => med.name).join(', ')}
                        </div>
                        {prescription.deliveredBy && (
                          <div className="mt-1 text-sm text-gray-600">
                            <strong>Delivered by:</strong> {prescription.deliveredBy}
                            {prescription.deliveredDate && ` on ${formatDate(prescription.deliveredDate)}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/prescriptions/${prescription.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      {prescription.status === 'pending' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                          Approve
                        </button>
                      )}
                      {prescription.status === 'approved' && (
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm">
                          Dispense
                        </button>
                      )}
                      {prescription.status === 'dispensed' && (
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm">
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
