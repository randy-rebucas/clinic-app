'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, User, Phone, Mail, Calendar, Edit, Trash2, Eye, Filter, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PatientsPage() {
  const { user, employee } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    isActive: '',
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    insuranceProvider: '',
    insuranceNumber: '',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      fetchAllPatients();
    }
  }, [user, employee]);

  const fetchAllPatients = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      fetchAllPatients();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatients(searchQuery);
  };

  const updatePatient = async () => {
    if (!selectedPatient) return;

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update patient');
      }

      alert('Patient updated successfully!');
      setShowEditModal(false);
      setSelectedPatient(null);
      fetchAllPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient');
    }
  };

  const deletePatient = async (patientToDelete: Patient) => {
    if (!confirm(`Are you sure you want to delete patient ${patientToDelete.firstName} ${patientToDelete.lastName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      alert('Patient deleted successfully!');
      fetchAllPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  const togglePatientStatus = async (patientToToggle: Patient) => {
    try {
      const response = await fetch(`/api/patients/${patientToToggle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !patientToToggle.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update patient status');
      }

      alert(`Patient ${patientToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchAllPatients();
    } catch (error) {
      console.error('Error updating patient status:', error);
      alert('Failed to update patient status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = !filters.gender || patient.gender === filters.gender;
    const matchesActive = !filters.isActive || 
      (filters.isActive === 'active' && patient.isActive) ||
      (filters.isActive === 'inactive' && !patient.isActive);

    return matchesSearch && matchesGender && matchesActive;
  });

  const exportPatients = () => {
    const csvContent = [
      ['Patient ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'Created'],
      ...filteredPatients.map(patient => [
        patient.patientId,
        `${patient.firstName} ${patient.lastName}`,
        patient.email || '',
        patient.phone || '',
        calculateAge(patient.dateOfBirth).toString(),
        patient.gender,
        patient.isActive ? 'Active' : 'Inactive',
        formatDate(patient.createdAt),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      <header className="bg-white shadow-sm shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Go back to dashboard"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </Link>
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {employee?.role === 'admin' && (
                <button
                  onClick={exportPatients}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              )}
              <button
                onClick={fetchAllPatients}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/patients/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Patients</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, patient ID, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {employee?.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => setFilters({ gender: '', ageRange: '', isActive: '' })}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 shadow-sm text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {filteredPatients.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Patients ({filteredPatients.length} found)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredPatients.map((patient, index) => (
                    <tr key={patient.id || `patient-${index}`} className="hover:bg-gray-50 shadow-sm rounded-lg mx-2 my-1">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{patient.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{patient.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculateAge(patient.dateOfBirth)} years</div>
                        <div className="text-sm text-gray-500 capitalize">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setEditForm({
                              firstName: patient.firstName,
                              lastName: patient.lastName,
                              email: patient.email || '',
                              phone: patient.phone || '',
                              dateOfBirth: patient.dateOfBirth,
                              gender: patient.gender,
                              address: patient.address || '',
                              emergencyContact: patient.emergencyContact || '',
                              medicalHistory: patient.medicalHistory || '',
                              allergies: patient.allergies || '',
                              insuranceProvider: patient.insuranceProvider || '',
                              insuranceNumber: patient.insuranceNumber || '',
                              isActive: patient.isActive,
                            });
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        {employee?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setEditForm({
                                  firstName: patient.firstName,
                                  lastName: patient.lastName,
                                  email: patient.email || '',
                                  phone: patient.phone || '',
                                  dateOfBirth: patient.dateOfBirth,
                                  gender: patient.gender,
                                  address: patient.address || '',
                                  emergencyContact: patient.emergencyContact || '',
                                  medicalHistory: patient.medicalHistory || '',
                                  allergies: patient.allergies || '',
                                  insuranceProvider: patient.insuranceProvider || '',
                                  insuranceNumber: patient.insuranceNumber || '',
                                  isActive: patient.isActive,
                                });
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => togglePatientStatus(patient)}
                              className={`${patient.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} flex items-center`}
                            >
                              {patient.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deletePatient(patient)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </>
                        )}
                        <Link
                          href={`/appointments/new?patientId=${patient.id}`}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          Book Appointment
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && patients.length === 0 && !loading && (
          <div className="bg-white p-8 rounded-lg shadow-sm shadow-gray-200/50 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500 mb-4">
              No patients match your search criteria. Try a different search term.
            </p>
            <Link
              href="/patients/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Patient
            </Link>
          </div>
        )}

        {/* Initial State - Only show when there are no patients at all */}
        {!searchQuery && patients.length === 0 && !loading && (
          <div className="bg-white p-8 rounded-lg shadow-sm shadow-gray-200/50 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500 mb-4">
              There are no patients in the system yet. Add your first patient to get started.
            </p>
            <Link
              href="/patients/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Patient
            </Link>
          </div>
        )}
      </main>

      {/* Patient Details Modal */}
      {showDetails && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg shadow-gray-200/50 rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.patientId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="mt-1 text-sm text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.emergencyContact || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.insuranceProvider || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.insuranceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPatient.createdAt)}</p>
                  </div>
                </div>
                
                {selectedPatient.medicalHistory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical History</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.medicalHistory}</p>
                  </div>
                )}
                
                {selectedPatient.allergies && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.allergies}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg shadow-gray-200/50 rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Patient</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      value={editForm.insuranceProvider}
                      onChange={(e) => setEditForm(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                    <input
                      type="text"
                      value={editForm.insuranceNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm shadow-gray-200/50 focus:shadow-blue-200/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <textarea
                    value={editForm.medicalHistory}
                    onChange={(e) => setEditForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea
                    value={editForm.allergies}
                    onChange={(e) => setEditForm(prev => ({ ...prev, allergies: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm shadow-gray-200/50 hover:shadow-gray-300/50"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePatient}
                  disabled={!editForm.firstName || !editForm.lastName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
