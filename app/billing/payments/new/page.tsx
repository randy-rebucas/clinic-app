'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Search, 
  Save, 
  ArrowLeft,
  DollarSign,
  FileText,
  User
} from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceId: string;
  patientId: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  items: Record<string, unknown>[];
}

// interface Patient {
//   id: string;
//   patientId: string;
//   firstName: string;
//   lastName: string;
//   email?: string;
//   phone?: string;
// }

export default function NewPaymentPage() {
  const { user, employee } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: '',
    patientId: '',
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'card' | 'insurance' | 'bank-transfer',
    reference: '',
    notes: ''
  });

  const searchInvoices = async (query: string) => {
    if (!query.trim()) {
      setInvoices([]);
      return;
    }

    try {
      const response = await fetch(`/api/billing/invoices?status=sent`);
      if (!response.ok) throw new Error('Failed to search invoices');
      const data = await response.json();
      const filtered = data.filter((invoice: Invoice) => 
        invoice.invoiceId.toLowerCase().includes(query.toLowerCase()) ||
        invoice.patientId.toLowerCase().includes(query.toLowerCase())
      );
      setInvoices(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData(prev => ({ 
      ...prev, 
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      amount: invoice.totalAmount
    }));
    setShowInvoiceSearch(false);
    setSearchQuery('');
    setInvoices([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.invoiceId || !formData.patientId || !formData.amount || !formData.paymentMethod) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      const paymentData = {
        ...formData,
        processedBy: user?.id || 'system'
      };

      const response = await fetch('/api/billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      await response.json();
      setSuccess('Payment processed successfully!');
      
      // Redirect to billing page
      setTimeout(() => {
        router.push('/billing');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                href="/billing"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CreditCard className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
            
            {selectedInvoice ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {selectedInvoice.invoiceId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient ID: {selectedInvoice.patientId}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due Date: {formatDate(selectedInvoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedInvoice.totalAmount)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedInvoice.status === 'sent' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInvoice(null);
                    setFormData(prev => ({ 
                      ...prev, 
                      invoiceId: '', 
                      patientId: '', 
                      amount: 0 
                    }));
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Change Invoice
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
                      searchInvoices(e.target.value);
                      setShowInvoiceSearch(true);
                    }}
                    placeholder="Search for invoice by ID or patient ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {showInvoiceSearch && invoices.length > 0 && (
                  <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                    {invoices.map((invoice) => (
                      <button
                        key={invoice.id}
                        type="button"
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {invoice.invoiceId}
                            </div>
                            <div className="text-sm text-gray-600">
                              Patient: {invoice.patientId} • Due: {formatDate(invoice.dueDate)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === 'sent' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                {selectedInvoice && (
                  <p className="text-sm text-gray-500 mt-1">
                    Invoice total: {formatCurrency(selectedInvoice.totalAmount)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' | 'insurance' | 'bank-transfer' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Transaction ID, check number, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processed By
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{employee?.name || 'System'}</span>
                </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional payment notes..."
              />
            </div>
          </div>

          {/* Payment Summary */}
          {selectedInvoice && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Total:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Amount:</span>
                  <span className="font-medium text-green-600">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{formData.paymentMethod}</span>
                </div>
                {formData.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{formData.reference}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Remaining Balance:</span>
                    <span className={`text-lg font-bold ${
                      (selectedInvoice.totalAmount - formData.amount) > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(selectedInvoice.totalAmount - formData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              href="/billing"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedInvoice}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Process Payment
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
