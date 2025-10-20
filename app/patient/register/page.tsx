'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Heart, AlertCircle, CheckCircle, CreditCard, Eye, EyeOff } from 'lucide-react';
import { validatePatientForm, ValidationError, PatientFormData, sanitizeInput, formatPhoneNumber } from '@/lib/validation/patientValidation';

export default function PatientRegisterPage() {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PH',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const totalSteps = 5;

  // Form persistence
  useEffect(() => {
    const savedFormData = localStorage.getItem('patientRegistrationForm');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem('patientRegistrationForm', JSON.stringify(formData));
  }, [formData]);

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
    const completedRequired = requiredFields.filter(field => formData[field as keyof PatientFormData]?.trim()).length;
    const progress = (completedRequired / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [formData]);

  // Clear form data on successful registration
  useEffect(() => {
    if (success) {
      localStorage.removeItem('patientRegistrationForm');
    }
  }, [success]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field !== name));
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
    }
  }, []);

  const validateCurrentStep = useCallback(() => {
    const errors = validatePatientForm(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  const validateStep = useCallback((step: number) => {
    const stepErrors: ValidationError[] = [];
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) stepErrors.push({ field: 'firstName', message: 'First name is required' });
        if (!formData.lastName.trim()) stepErrors.push({ field: 'lastName', message: 'Last name is required' });
        if (!formData.dateOfBirth) stepErrors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
        if (!formData.gender) stepErrors.push({ field: 'gender', message: 'Gender is required' });
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          stepErrors.push({ field: 'email', message: 'Please enter a valid email address' });
        }
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          stepErrors.push({ field: 'phone', message: 'Please enter a valid 10-digit phone number' });
        }
        break;
      case 2: // Address Information
        // Address fields are optional, no validation needed
        break;
      case 3: // Emergency Contact
        // Emergency contact fields are optional, no validation needed
        break;
      case 4: // Medical Information
        // Medical fields are optional, no validation needed
        break;
      case 5: // Insurance Information
        // Insurance fields are optional, no validation needed
        break;
    }
    
    return stepErrors;
  }, [formData]);

  const canProceedToNextStep = useCallback((step: number) => {
    const stepErrors = validateStep(step);
    return stepErrors.length === 0;
  }, [validateStep]);

  const handleNextStep = useCallback(() => {
    if (canProceedToNextStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, canProceedToNextStep]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Debounced validation for current step
  useEffect(() => {
    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      const stepErrors = validateStep(currentStep);
      setValidationErrors(stepErrors);
      setIsValidating(false);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [formData, currentStep, validateStep]);

  const getFieldError = useCallback((fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  }, [validationErrors]);

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      const form = e.currentTarget.closest('form');
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea')) as HTMLElement[];
        const currentIndex = inputs.indexOf(e.target);
        const nextInput = inputs[currentIndex + 1];
        
        if (nextInput) {
          e.preventDefault();
          nextInput.focus();
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    // Validate all steps before submission
    const allErrors: ValidationError[] = [];
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step);
      allErrors.push(...stepErrors);
    }
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/patient/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: {
            street: formData.street || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            zipCode: formData.zipCode || undefined,
            country: formData.country
          },
          emergencyContact: {
            name: formData.emergencyContactName || undefined,
            relationship: formData.emergencyContactRelationship || undefined,
            phone: formData.emergencyContactPhone || undefined
          },
          medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(h => h.trim()) : undefined,
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : undefined,
          medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : undefined,
          insurance: {
            provider: formData.insuranceProvider || undefined,
            policyNumber: formData.insurancePolicyNumber || undefined,
            groupNumber: formData.insuranceGroupNumber || undefined
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/patient/login');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Address', icon: MapPin },
    { id: 3, name: 'Emergency Contact', icon: Phone },
    { id: 4, name: 'Medical Info', icon: Heart },
    { id: 5, name: 'Insurance', icon: CreditCard }
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Registration Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your patient account has been created. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="mt-2 text-gray-600">Create your patient account to access your medical records</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={handleKeyDown}
            className="space-y-6"
            role="form"
            aria-label="Patient Registration Form"
            noValidate
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" aria-hidden="true" />
                  Personal Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    aria-describedby={getFieldError('firstName') ? 'firstName-error' : undefined}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('firstName') 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('firstName') && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {getFieldError('firstName')}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('phone') 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('phone') && (
                    <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                      {getFieldError('phone')}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </fieldset>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" aria-hidden="true" />
                  Address Information
                </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </fieldset>
            )}

            {/* Step 3: Emergency Contact */}
            {currentStep === 3 && (
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
                  Emergency Contact
                </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </fieldset>
            )}

            {/* Step 4: Medical Information */}
            {currentStep === 4 && (
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2" aria-hidden="true" />
                  Medical Information
                </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                    Medical History (comma-separated)
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={3}
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Diabetes, Hypertension, Heart Disease"
                  />
                </div>
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                    Allergies (comma-separated)
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={3}
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Penicillin, Shellfish, Latex"
                  />
                </div>
                <div>
                  <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
                    Current Medications (comma-separated)
                  </label>
                  <textarea
                    id="medications"
                    name="medications"
                    rows={3}
                    value={formData.medications}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Metformin, Lisinopril, Aspirin"
                  />
                </div>
              </div>
            </fieldset>
            )}

            {/* Step 5: Insurance Information */}
            {currentStep === 5 && (
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" aria-hidden="true" />
                  Insurance Information
                </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="insuranceProvider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="insurancePolicyNumber"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="insuranceGroupNumber" className="block text-sm font-medium text-gray-700">
                    Group Number
                  </label>
                  <input
                    type="text"
                    id="insuranceGroupNumber"
                    name="insuranceGroupNumber"
                    value={formData.insuranceGroupNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </fieldset>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Previous
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => router.push('/patient/login')}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back to Login
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                {isValidating && (
                  <div className="text-sm text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Validating...
                  </div>
                )}
                {!isValidating && validationErrors.length > 0 && (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''} found
                  </div>
                )}
                {!isValidating && validationErrors.length === 0 && formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender && (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Step is valid
                  </div>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!canProceedToNextStep(currentStep)}
                    className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || validationErrors.length > 0}
                    className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}