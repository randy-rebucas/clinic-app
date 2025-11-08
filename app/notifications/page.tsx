'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Calendar, 
  TestTube, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in-app';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'appointment-scheduled',
    name: 'Appointment Scheduled',
    type: 'email',
    description: 'Send when a new appointment is scheduled',
    icon: Calendar
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    type: 'email',
    description: 'Send 24 hours before appointment',
    icon: Clock
  },
  {
    id: 'appointment-cancelled',
    name: 'Appointment Cancelled',
    type: 'email',
    description: 'Send when an appointment is cancelled',
    icon: AlertCircle
  },
  {
    id: 'lab-results-ready',
    name: 'Lab Results Ready',
    type: 'email',
    description: 'Send when lab results are available',
    icon: TestTube
  },
  {
    id: 'lab-results-critical',
    name: 'Critical Lab Results',
    type: 'email',
    description: 'Send for critical lab results requiring immediate attention',
    icon: AlertCircle
  },
  {
    id: 'invoice-generated',
    name: 'Invoice Generated',
    type: 'email',
    description: 'Send when a new invoice is created',
    icon: CreditCard
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    type: 'email',
    description: 'Send when a payment is processed',
    icon: CheckCircle
  },
  {
    id: 'payment-overdue',
    name: 'Payment Overdue',
    type: 'email',
    description: 'Send for overdue payments',
    icon: AlertCircle
  },
  {
    id: 'queue-update',
    name: 'Queue Update',
    type: 'sms',
    description: 'Send queue position updates',
    icon: Users
  },
  {
    id: 'doctor-ready',
    name: 'Doctor Ready',
    type: 'sms',
    description: 'Send when doctor is ready to see patient',
    icon: CheckCircle
  }
];

export default function NotificationsPage() {
  const { employee } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipients, setRecipients] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Check if user has permission to send notifications
  const canSendNotifications = employee?.role === 'admin' || employee?.role === 'receptionist';

  if (!canSendNotifications) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access the notifications system.</p>
        </div>
      </div>
    );
  }

  const selectedTemplateData = NOTIFICATION_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setVariables({});
    setError('');
    setSuccess('');
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleSendNotification = async () => {
    if (!selectedTemplate || !recipients.trim()) {
      setError('Please select a template and enter recipients');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: recipients.split(',').map(r => r.trim()),
          template: selectedTemplate,
          variables,
          priority: 'normal'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      setSuccess('Notification sent successfully!');
      setRecipients('');
      setVariables({});
      setSelectedTemplate('');

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateVariables = (templateId: string): string[] => {
    // This would normally come from the template definition
    const variableMap: Record<string, string[]> = {
      'appointment-scheduled': ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType', 'reason'],
      'appointment-reminder': ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType'],
      'appointment-cancelled': ['patientName', 'appointmentDate', 'appointmentTime', 'cancellationReason'],
      'lab-results-ready': ['patientName', 'labOrderDate', 'labOrderId', 'testNames'],
      'lab-results-critical': ['patientName', 'labOrderId', 'criticalTests'],
      'invoice-generated': ['patientName', 'invoiceId', 'totalAmount', 'dueDate'],
      'payment-received': ['patientName', 'invoiceId', 'amountPaid', 'paymentMethod', 'paymentDate'],
      'payment-overdue': ['patientName', 'invoiceId', 'totalAmount', 'dueDate', 'daysOverdue'],
      'queue-update': ['position', 'waitTime'],
      'doctor-ready': ['doctorName', 'roomNumber']
    };

    return variableMap[templateId] || [];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'in-app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'in-app':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm-b">
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
              <Bell className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Notifications</h2>
          <p className="text-gray-600">Send automated notifications to patients and staff.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h3>
            
            <div className="space-y-3">
              {NOTIFICATION_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? 'shadow-[0_1px_0_0_rgba(0,0,0,0.05)]lue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          selectedTemplate === template.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            selectedTemplate === template.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                        {getTypeIcon(template.type)}
                        <span className="ml-1">{template.type}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h3>
            
            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  <input
                    type="text"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    placeholder="Enter email addresses or phone numbers (comma-separated)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple recipients with commas
                  </p>
                </div>

                {/* Template Variables */}
                {getTemplateVariables(selectedTemplate).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Variables
                    </label>
                    <div className="space-y-3">
                      {getTemplateVariables(selectedTemplate).map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm text-gray-600 mb-1">
                            {variable}
                          </label>
                          <input
                            type="text"
                            value={variables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            className="w-full px-3 py-2 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Toggle */}
                <div className="flex items-center">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>

                {/* Preview */}
                {previewMode && selectedTemplateData && (
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                    <div className="text-sm text-gray-600">
                      <p><strong>Type:</strong> {selectedTemplateData.type}</p>
                      <p><strong>Template:</strong> {selectedTemplateData.name}</p>
                      <p><strong>Recipients:</strong> {recipients || 'None specified'}</p>
                      {Object.keys(variables).length > 0 && (
                        <div className="mt-2">
                          <p><strong>Variables:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {Object.entries(variables).map(([key, value]) => (
                              <li key={key}>{key}: {value}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendNotification}
                  disabled={loading || !recipients.trim()}
                  className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                    loading || !recipients.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a template to get started</p>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 shadow-sm text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setSelectedTemplate('appointment-reminder');
                setRecipients('');
                setVariables({});
              }}
              className="p-4 shadow-sm rounded-lg hover:shadow-[0_1px_0_0_rgba(0,0,0,0.05)]lue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <Clock className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Send Appointment Reminders</h4>
              <p className="text-sm text-gray-600">Send reminders for tomorrow&apos;s appointments</p>
            </button>

            <button
              onClick={() => {
                setSelectedTemplate('lab-results-ready');
                setRecipients('');
                setVariables({});
              }}
              className="p-4 shadow-sm rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
            >
              <TestTube className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Notify Lab Results</h4>
              <p className="text-sm text-gray-600">Send lab results to patients</p>
            </button>

            <button
              onClick={() => {
                setSelectedTemplate('payment-overdue');
                setRecipients('');
                setVariables({});
              }}
              className="p-4 shadow-sm rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
            >
              <CreditCard className="h-6 w-6 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Payment Reminders</h4>
              <p className="text-sm text-gray-600">Send overdue payment notifications</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
