'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Save, 
  ArrowLeft,
  Search,
  Clock,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
}

export default function NewQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'emergency',
    type: 'consultation' as 'consultation' | 'follow-up' | 'emergency' | 'routine',
    reason: '',
    assignedDoctorId: '',
    estimatedWaitTime: 30,
    notes: ''
  });

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setPatients([]);
      return;
    }

    try {
      const response = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search patients');
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchDoctors = async () => {
    try {
      // In a real app, you would fetch doctors from an API
      // For now, we'll use mock data
      const mockDoctors = [
        { id: 'doctor1', name: 'Dr. Smith', specialization: 'General Medicine' },
        { id: 'doctor2', name: 'Dr. Johnson', specialization: 'Cardiology' },
        { id: 'doctor3', name: 'Dr. Williams', specialization: 'Pediatrics' },
        { id: 'doctor4', name: 'Dr. Brown', specialization: 'Dermatology' }
      ];
      setDoctors(mockDoctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setShowPatientSearch(false);
    setSearchQuery('');
    setPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.patientId || !formData.reason) {
        throw new Error('Please select a patient and provide a reason');
      }

      const queueData = {
        ...formData,
        estimatedWaitTime: parseInt(formData.estimatedWaitTime.toString())
      };

      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add patient to queue');
      }

      await response.json();
      setSuccess('Patient added to queue successfully!');
      
      // Redirect to queue page
      setTimeout(() => {
        router.push('/queue');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]lue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/queue"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <ClipboardList className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Add Patient to Queue</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
            
            {selectedPatient ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {selectedPatient.patientId}
                    {selectedPatient.email && ` • ${selectedPatient.email}`}
                    {selectedPatient.phone && ` • ${selectedPatient.phone}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setFormData(prev => ({ ...prev, patientId: '' }));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchPatients(e.target.value);
                      setShowPatientSearch(true);
                    }}
                    placeholder="Search for patient by name, ID, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  />
                </div>
                
                {showPatientSearch && patients.length > 0 && (
                  <div className="shadow-sm shadow-sm rounded-md max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {patient.patientId}
                          {patient.email && ` • ${patient.email}`}
                          {patient.phone && ` • ${patient.phone}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Queue Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Queue Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'normal' | 'high' | 'emergency' }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  required
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
                <div className={`mt-1 px-2 py-1 rounded text-xs shadow-sm ${getPriorityColor(formData.priority)}`}>
                  {formData.priority === 'emergency' && 'Immediate attention required'}
                  {formData.priority === 'high' && 'Priority treatment needed'}
                  {formData.priority === 'normal' && 'Standard queue position'}
                  {formData.priority === 'low' && 'Can wait longer if needed'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'consultation' | 'follow-up' | 'emergency' | 'routine' }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Doctor
                </label>
                <select
                  value={formData.assignedDoctorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedDoctorId: e.target.value }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                >
                  <option value="">Select Doctor (Optional)</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Wait Time (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={formData.estimatedWaitTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedWaitTime: parseInt(e.target.value) || 30 }))}
                    className="w-full pl-10 pr-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.appointmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentId: e.target.value }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="APT-..."
                />
              </div>
            </div>
          </div>

          {/* Reason and Notes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Describe the reason for the visit..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Any additional information or special requirements..."
                />
              </div>
            </div>
          </div>

          {/* Priority Warning */}
          {formData.priority === 'emergency' && (
            <div className="bg-red-50 shadow-sm rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="font-medium text-red-800">Emergency Priority</h3>
                  <p className="text-sm text-red-700">
                    This patient will be placed at the top of the queue and should be seen immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 shadow-sm text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 shadow-sm text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/queue"
              className="px-6 py-2 shadow-sm shadow-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPatient}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add to Queue
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
