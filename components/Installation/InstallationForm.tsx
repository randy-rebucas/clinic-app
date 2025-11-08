'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  Mail, 
  Building, 
  MapPin, 
  Phone, 
  Clock, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface InstallationFormData {
  // Admin User
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  
  // Clinic Information
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  clinicState: string;
  clinicZipCode: string;
  clinicCountry: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  
  // Business Hours
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  
  // System Settings
  timezone: string;
  currency: string;
  includeSeedData: boolean;
}

interface InstallationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export default function InstallationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InstallationResult | null>(null);
  const [formData, setFormData] = useState<InstallationFormData>({
    // Admin User
    adminName: 'System Administrator',
    adminEmail: 'admin@clinic.com',
    adminPassword: 'Admin123!@#',
    confirmPassword: 'Admin123!@#',
    
    // Clinic Information
    clinicName: 'My Clinic',
    clinicAddress: '123 Main Street',
    clinicCity: 'New York',
    clinicState: 'NY',
    clinicZipCode: '10001',
    clinicCountry: 'PH',
    clinicPhone: '+1 (555) 123-4567',
    clinicEmail: 'info@clinic.com',
    clinicWebsite: 'https://clinic.com',
    
    // Business Hours
    businessHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: false },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    
    // System Settings
    timezone: 'Asia/Beijing',
    currency: 'PHP',
    includeSeedData: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.startsWith('businessHours.')) {
      const [day, field] = name.split('.').slice(1);
      setFormData(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [day]: {
            ...prev.businessHours[day as keyof typeof prev.businessHours],
            [field]: field === 'isOpen' ? checked : value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.adminName && formData.adminEmail && formData.adminPassword && 
                 formData.confirmPassword && formData.adminPassword === formData.confirmPassword);
      case 2:
        return !!(formData.clinicName && formData.clinicAddress && formData.clinicCity && 
                 formData.clinicState && formData.clinicZipCode && formData.clinicPhone && formData.clinicEmail);
      case 3:
        return true; // Business hours are optional
      case 4:
        return true; // System settings have defaults
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInstallation = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setup',
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          includeSeedData: formData.includeSeedData,
          resetExisting: false,
          clinicSettings: {
            clinicName: formData.clinicName,
            clinicAddress: {
              street: formData.clinicAddress,
              city: formData.clinicCity,
              state: formData.clinicState,
              zipCode: formData.clinicZipCode,
              country: formData.clinicCountry
            },
            clinicPhone: formData.clinicPhone,
            clinicEmail: formData.clinicEmail,
            clinicWebsite: formData.clinicWebsite,
            businessHours: formData.businessHours,
            timezone: formData.timezone,
            currency: formData.currency
          }
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Redirect to login page after successful installation
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Installation failed due to network error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Admin Account', icon: User },
    { id: 2, name: 'Clinic Info', icon: Building },
    { id: 3, name: 'Business Hours', icon: Clock },
    { id: 4, name: 'System Settings', icon: Settings }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="adminName"
                  name="adminName"
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter administrator name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter administrator email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter administrator password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:shadow-md ${
                    formData.confirmPassword && formData.adminPassword !== formData.confirmPassword
                      ? 'focus:ring-red-500 shadow-red-100'
                      : formData.confirmPassword && formData.adminPassword === formData.confirmPassword
                      ? 'focus:ring-green-500 shadow-green-100'
                      : 'focus:ring-blue-500'
                  }`}
                  placeholder="Confirm administrator password"
                />
              </div>
              {formData.confirmPassword && formData.adminPassword !== formData.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Name
              </label>
              <input
                id="clinicName"
                name="clinicName"
                type="text"
                required
                value={formData.clinicName}
                onChange={handleInputChange}
                className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                placeholder="Enter clinic name"
              />
            </div>

            <div>
              <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="clinicAddress"
                  name="clinicAddress"
                  type="text"
                  required
                  value={formData.clinicAddress}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="clinicCity" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="clinicCity"
                  name="clinicCity"
                  type="text"
                  required
                  value={formData.clinicCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="City"
                />
              </div>
              <div>
                <label htmlFor="clinicState" className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  id="clinicState"
                  name="clinicState"
                  type="text"
                  required
                  value={formData.clinicState}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="clinicZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  id="clinicZipCode"
                  name="clinicZipCode"
                  type="text"
                  required
                  value={formData.clinicZipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="ZIP Code"
                />
              </div>
              <div>
                <label htmlFor="clinicCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  id="clinicCountry"
                  name="clinicCountry"
                  type="text"
                  required
                  value={formData.clinicCountry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Country"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="clinicPhone"
                  name="clinicPhone"
                  type="tel"
                  required
                  value={formData.clinicPhone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="clinicEmail"
                  name="clinicEmail"
                  type="email"
                  required
                  value={formData.clinicEmail}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                  placeholder="Enter clinic email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                id="clinicWebsite"
                name="clinicWebsite"
                type="url"
                value={formData.clinicWebsite}
                onChange={handleInputChange}
                className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                placeholder="https://your-clinic.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 mb-6">
              Set your clinic's business hours. You can modify these later in the settings.
            </p>
            
            {Object.entries(formData.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`businessHours.${day}.isOpen`}
                    checked={hours.isOpen}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 shadow-sm rounded"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </div>
                
                {hours.isOpen && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      name={`businessHours.${day}.open`}
                      value={hours.open}
                      onChange={handleInputChange}
                      className="px-3 py-2 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      name={`businessHours.${day}.close`}
                      value={hours.close}
                      onChange={handleInputChange}
                      className="px-3 py-2 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
              >
                <option value="Asia/Beijing">Asia/Beijing (China Standard Time)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-3 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md"
              >
                <option value="PHP">Philippine Peso (PHP)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
              </select>
            </div>

            <div className="flex items-center p-4 bg-blue-50 rounded-xl">
              <input
                id="includeSeedData"
                name="includeSeedData"
                type="checkbox"
                checked={formData.includeSeedData}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeSeedData" className="ml-3 text-sm text-gray-700">
                Include sample data (patients, doctors, appointments) to help you get started
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation Complete!</h2>
          <p className="text-gray-600 mb-6">
            MediNext has been successfully set up. You can now log in with your administrator credentials.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Admin Credentials:</p>
            <p className="text-sm font-mono text-gray-800">Email: {formData.adminEmail}</p>
            <p className="text-sm font-mono text-gray-800">Password: {formData.adminPassword}</p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
              <Settings className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MediNext
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Welcome! Let's set up MediNext
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : isCompleted 
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-gray-400 shadow-sm'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 shadow-sm rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallation}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    'Install System'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Result Display */}
          {result && !result.success && (
            <div className="mt-6 p-4 bg-red-50 shadow-sm rounded-xl">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="font-medium text-red-800">{result.message}</p>
              </div>
              
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
