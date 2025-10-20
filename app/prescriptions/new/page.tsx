'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export default function NewPrescriptionPage() {
  const { user, employee } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; patientId: string; firstName: string; lastName: string; email?: string; phone?: string } | null>(null);
  const [formData, setFormData] = useState({
    appointmentId: '',
    diagnosis: '',
    notes: '',
    validUntil: ''
  });
  const [medications, setMedications] = useState<Medication[]>([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string | number) => {
    const newMedications = [...medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value
    };
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setSelectedPatient(null);
      return;
    }

    try {
      const response = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search patients');
      }
      const patients = await response.json();
      if (patients.length > 0) {
        setSelectedPatient(patients[0]);
      } else {
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
      setSelectedPatient(null);
    }
  };

  const handlePatientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatients(patientSearch);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedPatient) {
        throw new Error('Please select a patient');
      }

      if (!employee?.id) {
        throw new Error('Doctor information not available');
      }

      // Validate medications
      const validMedications = medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
      );

      if (validMedications.length === 0) {
        throw new Error('Please add at least one valid medication');
      }

      const prescriptionData = {
        patientId: selectedPatient.id,
        doctorId: employee.id,
        appointmentId: formData.appointmentId || undefined,
        medications: validMedications,
        diagnosis: formData.diagnosis,
        notes: formData.notes || undefined,
        validUntil: formData.validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
      };

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prescription');
      }

      const result = await response.json();
      router.push(`/prescriptions/${result.prescriptionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Prescription</h1>
            </div>
            <Link
              href="/prescriptions"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Selection</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient *
                </label>
                <form onSubmit={handlePatientSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="patientSearch"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search by patient ID, name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              {selectedPatient && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Selected Patient:</h3>
                  <div className="text-sm text-green-700">
                    <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                    {selectedPatient.email && <p><strong>Email:</strong> {selectedPatient.email}</p>}
                    {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment ID
                </label>
                <input
                  type="text"
                  id="appointmentId"
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleInputChange}
                  placeholder="Optional appointment ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis *
              </label>
              <input
                type="text"
                id="diagnosis"
                name="diagnosis"
                required
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter the diagnosis"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or instructions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Medications</h2>
              <button
                type="button"
                onClick={addMedication}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </button>
            </div>
            
            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-200 rounded-lg">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="e.g., Amoxicillin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      placeholder="e.g., 3 times daily"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={medication.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={medication.instructions || ''}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/prescriptions"
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPatient}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
