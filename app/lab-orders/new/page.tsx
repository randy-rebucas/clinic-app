'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  TestTube, 
  Plus, 
  Minus, 
  Save, 
  ArrowLeft,
  Search,
  User,
  Calendar
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

interface LabTest {
  testName: string;
  testCode: string;
  normalRange?: string;
  unit?: string;
  status: 'pending' | 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

const COMMON_TESTS = [
  { testName: 'Complete Blood Count (CBC)', testCode: 'CBC', normalRange: 'See individual components', unit: '' },
  { testName: 'Basic Metabolic Panel (BMP)', testCode: 'BMP', normalRange: 'See individual components', unit: '' },
  { testName: 'Comprehensive Metabolic Panel (CMP)', testCode: 'CMP', normalRange: 'See individual components', unit: '' },
  { testName: 'Lipid Panel', testCode: 'LIPID', normalRange: 'See individual components', unit: '' },
  { testName: 'Thyroid Stimulating Hormone (TSH)', testCode: 'TSH', normalRange: '0.4-4.0', unit: 'mIU/L' },
  { testName: 'Hemoglobin A1c', testCode: 'HBA1C', normalRange: '<5.7%', unit: '%' },
  { testName: 'Vitamin D', testCode: 'VITD', normalRange: '30-100', unit: 'ng/mL' },
  { testName: 'Urinalysis', testCode: 'UA', normalRange: 'See individual components', unit: '' },
  { testName: 'Chest X-Ray', testCode: 'CXR', normalRange: 'Normal', unit: '' },
  { testName: 'Electrocardiogram (EKG)', testCode: 'EKG', normalRange: 'Normal sinus rhythm', unit: '' }
];

export default function NewLabOrderPage() {
  const { user, employee } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: employee?.id || '',
    appointmentId: '',
    notes: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const [tests, setTests] = useState<LabTest[]>([
    {
      testName: '',
      testCode: '',
      normalRange: '',
      unit: '',
      status: 'pending',
      notes: ''
    }
  ]);

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setShowPatientSearch(false);
    setSearchQuery('');
    setPatients([]);
  };

  const addTest = () => {
    setTests(prev => [...prev, {
      testName: '',
      testCode: '',
      normalRange: '',
      unit: '',
      status: 'pending',
      notes: ''
    }]);
  };

  const removeTest = (index: number) => {
    if (tests.length > 1) {
      setTests(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTest = (index: number, field: keyof LabTest, value: string | number) => {
    setTests(prev => prev.map((test, i) => {
      if (i === index) {
        return { ...test, [field]: value };
      }
      return test;
    }));
  };

  const addCommonTest = (commonTest: { testName: string; testCode: string; normalRange: string; unit: string }) => {
    setTests(prev => [...prev, {
      testName: commonTest.testName,
      testCode: commonTest.testCode,
      normalRange: commonTest.normalRange,
      unit: commonTest.unit,
      status: 'pending',
      notes: ''
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.patientId || !formData.doctorId) {
        throw new Error('Please select a patient and ensure doctor is assigned');
      }

      const validTests = tests.filter(test => 
        test.testName.trim() && test.testCode.trim()
      );

      if (validTests.length === 0) {
        throw new Error('Please add at least one valid test');
      }

      const labOrderData = {
        ...formData,
        tests: validTests,
        followUpDate: formData.followUpRequired && formData.followUpDate 
          ? new Date(formData.followUpDate).toISOString()
          : undefined
      };

      const response = await fetch('/api/lab-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labOrderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lab order');
      }

      await response.json();
      setSuccess('Lab order created successfully!');
      
      // Redirect to lab orders page
      setTimeout(() => {
        router.push('/lab-orders');
      }, 2000);

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
              <Link
                href="/lab-orders"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Lab Order</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {showPatientSearch && patients.length > 0 && (
                  <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
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

          {/* Lab Order Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lab Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordering Doctor
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{employee?.name || 'Current User'}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="APT-..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes for the lab order..."
                />
              </div>
            </div>
          </div>

          {/* Lab Tests */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lab Tests</h2>
              <button
                type="button"
                onClick={addTest}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test
              </button>
            </div>

            {/* Common Tests */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Common Tests</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_TESTS.map((test, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addCommonTest(test)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {test.testName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      value={test.testName}
                      onChange={(e) => updateTest(index, 'testName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Test name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Code
                    </label>
                    <input
                      type="text"
                      value={test.testCode}
                      onChange={(e) => updateTest(index, 'testCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Normal Range
                    </label>
                    <input
                      type="text"
                      value={test.normalRange}
                      onChange={(e) => updateTest(index, 'normalRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Normal range"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={test.unit}
                      onChange={(e) => updateTest(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Unit"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    {tests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="followUpRequired" className="ml-2 block text-sm text-gray-700">
                  Follow-up required
                </label>
              </div>
              
              {formData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/lab-orders"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Lab Order
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}