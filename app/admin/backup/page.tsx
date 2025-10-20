'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Upload, Trash2, Plus, Calendar, HardDrive, FileText } from 'lucide-react';

interface Backup {
  filename: string;
  backupId: string;
  timestamp: Date;
  size: number;
  records: number;
}

export default function BackupPage() {
  const { user, employee } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [createForm, setCreateForm] = useState({
    collections: [] as string[],
    includeAuditLogs: false,
    description: '',
  });
  const [restoreForm, setRestoreForm] = useState({
    collections: [] as string[],
    skipExisting: false,
  });

  const availableCollections = [
    { id: 'users', name: 'Users', description: 'User accounts and authentication data' },
    { id: 'patients', name: 'Patients', description: 'Patient records and medical information' },
    { id: 'appointments', name: 'Appointments', description: 'Appointment scheduling and history' },
    { id: 'prescriptions', name: 'Prescriptions', description: 'Prescription records and medications' },
    { id: 'queue', name: 'Queue', description: 'Patient queue management data' },
    { id: 'invoices', name: 'Invoices', description: 'Billing and invoice records' },
    { id: 'payments', name: 'Payments', description: 'Payment processing records' },
    { id: 'labOrders', name: 'Lab Orders', description: 'Laboratory test orders and results' },
  ];

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchBackups();
    }
  }, [user, employee]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backup');
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error('Error loading backups:', error);
      setError('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          createdBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const result = await response.json();
      alert(`Backup created successfully! Backup ID: ${result.backup.backupId}`);
      setShowCreateModal(false);
      setCreateForm({ collections: [], includeAuditLogs: false, description: '' });
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      const response = await fetch(`/api/admin/backup/${selectedBackup.backupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...restoreForm,
          createdBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      alert('Backup restored successfully!');
      setShowRestoreModal(false);
      setSelectedBackup(null);
      setRestoreForm({ collections: [], skipExisting: false });
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup');
    }
  };

  const deleteBackup = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to delete backup ${backup.backupId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backup/${backup.backupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createdBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }

      alert('Backup deleted successfully!');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Failed to delete backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (!user || employee?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
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
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Backup
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {backups.reduce((total, backup) => total + backup.records, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Backup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {backups.length > 0 ? formatDate(backups[0].timestamp) : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Available Backups</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading backups...</div>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Found</h3>
              <p className="text-gray-500 mb-4">Create your first backup to get started.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Backup ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.backupId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {backup.backupId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(backup.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {backup.records.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => deleteBackup(backup)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Backup</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Collections
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCollections.map((collection) => (
                      <label key={collection.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createForm.collections.includes(collection.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm(prev => ({
                                ...prev,
                                collections: [...prev.collections, collection.id]
                              }));
                            } else {
                              setCreateForm(prev => ({
                                ...prev,
                                collections: prev.collections.filter(c => c !== collection.id)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                          <div className="text-xs text-gray-500">{collection.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createForm.includeAuditLogs}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        includeAuditLogs: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Audit Logs</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a description for this backup..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createBackup}
                  disabled={createForm.collections.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Restore Backup</h3>
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Restoring a backup will overwrite existing data. 
                  Make sure you have a current backup before proceeding.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup: {selectedBackup.backupId}
                  </label>
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(selectedBackup.timestamp)} | 
                    Size: {formatFileSize(selectedBackup.size)} | 
                    Records: {selectedBackup.records.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Collections to Restore
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCollections.map((collection) => (
                      <label key={collection.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={restoreForm.collections.includes(collection.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRestoreForm(prev => ({
                                ...prev,
                                collections: [...prev.collections, collection.id]
                              }));
                            } else {
                              setRestoreForm(prev => ({
                                ...prev,
                                collections: prev.collections.filter(c => c !== collection.id)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">{collection.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={restoreForm.skipExisting}
                      onChange={(e) => setRestoreForm(prev => ({
                        ...prev,
                        skipExisting: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Skip existing records</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={restoreBackup}
                  disabled={restoreForm.collections.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Restore Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
