'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Plus, 
  Minus, 
  Save, 
  ArrowLeft,
  Calculator
} from 'lucide-react';
import Link from 'next/link';

interface BillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'consultation' | 'medication' | 'lab-test' | 'procedure' | 'other';
}

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export default function NewInvoicePage() {
  const { user } = useAuth();
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
    appointmentId: '',
    prescriptionId: '',
    taxRate: 0,
    discountAmount: 0,
    dueDate: '',
    notes: ''
  });

  const [items, setItems] = useState<BillingItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: 'consultation'
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

  const addItem = () => {
    setItems(prev => [...prev, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: 'consultation'
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BillingItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const totalAmount = subtotal + taxAmount - formData.discountAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.patientId) {
        throw new Error('Please select a patient');
      }

      const validItems = items.filter(item => 
        item.description.trim() && item.quantity > 0 && item.unitPrice > 0
      );

      if (validItems.length === 0) {
        throw new Error('Please add at least one valid item');
      }

      const { subtotal, taxAmount, totalAmount } = calculateTotals();

      const invoiceData = {
        ...formData,
        items: validItems,
        subtotal,
        taxAmount,
        totalAmount,
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      await response.json();
      setSuccess('Invoice created successfully!');
      
      // Redirect to invoice details or billing page
      setTimeout(() => {
        router.push('/billing');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

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
      <header className="bg-white shadow-sm-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/billing"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchPatients(e.target.value);
                      setShowPatientSearch(true);
                    }}
                    placeholder="Search for patient by name, ID, email, or phone..."
                    className="w-full px-4 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  />
                </div>
                
                {showPatientSearch && patients.length > 0 && (
                  <div className="shadow-sm rounded-md max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] border-gray-100 last:shadow-[0_1px_0_0_rgba(0,0,0,0.05)]-0"
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

          {/* Invoice Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 shadow-sm rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="medication">Medication</option>
                      <option value="lab-test">Lab Test</option>
                      <option value="procedure">Procedure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 shadow-sm rounded-md text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                />
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
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                placeholder="Additional notes for the invoice..."
              />
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Invoice Summary
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-${formData.discountAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 shadow-sm text-red-700 px-4 py-3 rounded-md">
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
              href="/billing"
              className="px-6 py-2 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}