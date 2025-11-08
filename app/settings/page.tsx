'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ApplicationSettings {
  clinicName: string;
  clinicAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite?: string;
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  appointmentSettings: {
    defaultDuration: number;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowOnlineBooking: boolean;
    requireConfirmation: boolean;
    autoConfirmAppointments: boolean;
  };
  billingSettings: {
    currency: string;
    taxRate: number;
    defaultPaymentTerms: number;
    lateFeeRate: number;
    allowPartialPayments: boolean;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
    labResultNotifications: boolean;
  };
  systemSettings: {
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    language: string;
    sessionTimeout: number;
  };
}

export default function SettingsPage() {
  const { user, employee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<ApplicationSettings | null>(null);
  const [activeTab, setActiveTab] = useState('clinic');

  useEffect(() => {
    if (user && employee?.role === 'admin') {
      fetchSettings();
    }
  }, [user, employee]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: unknown) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings Not Found</h1>
          <p className="text-gray-600">Application settings have not been initialized.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'clinic', label: 'Clinic Information' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'billing', label: 'Billing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'system', label: 'System' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Go back to dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Clinic Information Tab */}
        {activeTab === 'clinic' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Clinic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) => updateSettings('clinicName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={settings.clinicAddress.street}
                  onChange={(e) => updateSettings('clinicAddress.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={settings.clinicAddress.city}
                  onChange={(e) => updateSettings('clinicAddress.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={settings.clinicAddress.state}
                  onChange={(e) => updateSettings('clinicAddress.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                <input
                  type="text"
                  value={settings.clinicAddress.zipCode}
                  onChange={(e) => updateSettings('clinicAddress.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={settings.clinicPhone}
                  onChange={(e) => updateSettings('clinicPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.clinicEmail}
                  onChange={(e) => updateSettings('clinicEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={settings.clinicWebsite || ''}
                onChange={(e) => updateSettings('clinicWebsite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Appointment Settings</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.appointmentSettings.defaultDuration}
                  onChange={(e) => updateSettings('appointmentSettings.defaultDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Advance Booking (days)</label>
                <input
                  type="number"
                  value={settings.appointmentSettings.maxAdvanceBookingDays}
                  onChange={(e) => updateSettings('appointmentSettings.maxAdvanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Advance Booking (hours)</label>
              <input
                type="number"
                value={settings.appointmentSettings.minAdvanceBookingHours}
                onChange={(e) => updateSettings('appointmentSettings.minAdvanceBookingHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.appointmentSettings.allowOnlineBooking}
                  onChange={(e) => updateSettings('appointmentSettings.allowOnlineBooking', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Allow Online Booking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.appointmentSettings.requireConfirmation}
                  onChange={(e) => updateSettings('appointmentSettings.requireConfirmation', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Require Confirmation</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.appointmentSettings.autoConfirmAppointments}
                  onChange={(e) => updateSettings('appointmentSettings.autoConfirmAppointments', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Auto-Confirm Appointments</span>
              </label>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Billing Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <input
                type="text"
                value={settings.billingSettings.currency}
                onChange={(e) => updateSettings('billingSettings.currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.billingSettings.taxRate * 100}
                  onChange={(e) => updateSettings('billingSettings.taxRate', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment Terms (days)</label>
                <input
                  type="number"
                  value={settings.billingSettings.defaultPaymentTerms}
                  onChange={(e) => updateSettings('billingSettings.defaultPaymentTerms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.billingSettings.lateFeeRate * 100}
                onChange={(e) => updateSettings('billingSettings.lateFeeRate', parseFloat(e.target.value) / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.billingSettings.allowPartialPayments}
                onChange={(e) => updateSettings('billingSettings.allowPartialPayments', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Allow Partial Payments</span>
            </label>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.emailNotifications}
                  onChange={(e) => updateSettings('notificationSettings.emailNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.smsNotifications}
                  onChange={(e) => updateSettings('notificationSettings.smsNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.appointmentReminders}
                  onChange={(e) => updateSettings('notificationSettings.appointmentReminders', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Appointment Reminders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.paymentReminders}
                  onChange={(e) => updateSettings('notificationSettings.paymentReminders', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Payment Reminders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.labResultNotifications}
                  onChange={(e) => updateSettings('notificationSettings.labResultNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Lab Result Notifications</span>
              </label>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  type="text"
                  value={settings.systemSettings.timezone}
                  onChange={(e) => updateSettings('systemSettings.timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <input
                  type="text"
                  value={settings.systemSettings.dateFormat}
                  onChange={(e) => updateSettings('systemSettings.dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <select
                  value={settings.systemSettings.timeFormat}
                  onChange={(e) => updateSettings('systemSettings.timeFormat', e.target.value as '12h' | '24h')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <input
                  type="text"
                  value={settings.systemSettings.language}
                  onChange={(e) => updateSettings('systemSettings.language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.systemSettings.sessionTimeout}
                onChange={(e) => updateSettings('systemSettings.sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

