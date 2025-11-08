'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Calendar, FileText, TestTube, CreditCard, Bell, LogOut } from 'lucide-react';
// import Link from 'next/link';

interface PatientData {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

interface Appointment {
  id: string;
  appointmentId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  doctorId: string;
}

interface Prescription {
  id: string;
  prescriptionId: string;
  status: string;
  prescribedDate: string;
  validUntil: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  diagnosis: string;
}

interface LabOrder {
  id: string;
  labOrderId: string;
  status: string;
  orderedDate: string;
  tests: Array<{
    testName: string;
    testCode: string;
    status: string;
  }>;
}

interface Invoice {
  id: string;
  invoiceId: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export default function PatientPortalPage() {
  const { user, employee, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch patient data based on the logged-in user
      // For now, we'll simulate the data
      const mockPatientData: PatientData = {
        id: user?.id || '',
        patientId: 'PAT-001',
        firstName: 'John',
        lastName: 'Doe',
        email: user?.email || '',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin', 'Shellfish'],
        medications: ['Metformin 500mg', 'Lisinopril 10mg'],
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GRP001'
        }
      };

      setPatientData(mockPatientData);
      
      // Mock data for other sections
      setAppointments([
        {
          id: '1',
          appointmentId: 'APT-001',
          appointmentDate: '2024-01-15',
          startTime: '10:00',
          endTime: '10:30',
          type: 'consultation',
          status: 'scheduled',
          reason: 'Annual checkup',
          doctorId: 'DR-001'
        }
      ]);

      setPrescriptions([
        {
          id: '1',
          prescriptionId: 'RX-001',
          status: 'delivered',
          prescribedDate: '2024-01-10',
          validUntil: '2024-04-10',
          medications: [
            {
              name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '90 days'
            }
          ],
          diagnosis: 'Diabetes Type 2'
        }
      ]);

      setLabOrders([
        {
          id: '1',
          labOrderId: 'LAB-001',
          status: 'completed',
          orderedDate: '2024-01-12',
          tests: [
            {
              testName: 'Complete Blood Count',
              testCode: 'CBC',
              status: 'normal'
            }
          ]
        }
      ]);

      setInvoices([
        {
          id: '1',
          invoiceId: 'INV-001',
          totalAmount: 150.00,
          status: 'paid',
          dueDate: '2024-01-30',
          createdAt: '2024-01-15'
        }
      ]);

    } catch (error) {
      console.error('Error loading patient data:', error);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && employee?.role === 'patient') {
      fetchPatientData();
    }
  }, [user, employee, fetchPatientData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'delivered':
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || employee?.role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This portal is only accessible to patients.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading your portal...</div>
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
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {patientData?.firstName} {patientData?.lastName}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
                  { id: 'lab-results', label: 'Lab Results', icon: TestTube },
                  { id: 'billing', label: 'Billing', icon: CreditCard },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 shadow-sm text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                  {patientData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Name:</span> {patientData.firstName} {patientData.lastName}</p>
                          <p><span className="font-medium">Patient ID:</span> {patientData.patientId}</p>
                          <p><span className="font-medium">Date of Birth:</span> {formatDate(patientData.dateOfBirth)}</p>
                          <p><span className="font-medium">Gender:</span> {patientData.gender}</p>
                          <p><span className="font-medium">Email:</span> {patientData.email}</p>
                          <p><span className="font-medium">Phone:</span> {patientData.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Insurance Information</h3>
                        {patientData.insurance ? (
                          <div className="space-y-2">
                            <p><span className="font-medium">Provider:</span> {patientData.insurance.provider}</p>
                            <p><span className="font-medium">Policy Number:</span> {patientData.insurance.policyNumber}</p>
                            <p><span className="font-medium">Group Number:</span> {patientData.insurance.groupNumber}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No insurance information available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                        <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                        <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <TestTube className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Lab Results</p>
                        <p className="text-2xl font-bold text-gray-900">{labOrders.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.reason}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.appointmentDate)} at {appointment.startTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            Appointment ID: {appointment.appointmentId}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <h2 className="text-xl font-semibold text-gray-900">My Prescriptions</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Prescription {prescription.prescriptionId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p><span className="font-medium">Diagnosis:</span> {prescription.diagnosis}</p>
                        <p><span className="font-medium">Valid Until:</span> {formatDate(prescription.validUntil)}</p>
                        <div>
                          <span className="font-medium">Medications:</span>
                          <ul className="mt-1 space-y-1">
                            {prescription.medications.map((med, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {med.name} {med.dosage} - {med.frequency} for {med.duration}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Results Tab */}
            {activeTab === 'lab-results' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {labOrders.map((labOrder) => (
                    <div key={labOrder.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Lab Order {labOrder.labOrderId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(labOrder.status)}`}>
                          {labOrder.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p><span className="font-medium">Ordered Date:</span> {formatDate(labOrder.orderedDate)}</p>
                        <div>
                          <span className="font-medium">Tests:</span>
                          <ul className="mt-1 space-y-1">
                            {labOrder.tests.map((test, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {test.testName} ({test.testCode}) - {test.status}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Invoice {invoice.invoiceId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(invoice.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-500">No notifications at this time.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
