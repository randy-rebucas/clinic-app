export interface ValidationError {
  field: string;
  message: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's a valid US phone number (10 digits)
  return cleaned.length === 10;
};

export const validateZipCode = (zipCode: string): boolean => {
  // US ZIP code validation (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

export const validateDateOfBirth = (dateOfBirth: string): { isValid: boolean; message?: string } => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return { isValid: age - 1 >= 0, message: age - 1 < 0 ? 'Date of birth cannot be in the future' : undefined };
  }
  
  if (age < 0) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }
  
  if (age > 150) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }
  
  return { isValid: true };
};

export const validatePatientForm = (formData: PatientFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validation
  if (!formData.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (formData.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!formData.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (formData.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  if (!formData.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  } else {
    const dateValidation = validateDateOfBirth(formData.dateOfBirth);
    if (!dateValidation.isValid) {
      errors.push({ field: 'dateOfBirth', message: dateValidation.message || 'Invalid date of birth' });
    }
  }

  if (!formData.gender) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  }

  // Email validation (optional but must be valid if provided)
  if (formData.email && !validateEmail(formData.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Phone validation (optional but must be valid if provided)
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid 10-digit phone number' });
  }

  // ZIP code validation (optional but must be valid if provided)
  if (formData.zipCode && !validateZipCode(formData.zipCode)) {
    errors.push({ field: 'zipCode', message: 'Please enter a valid ZIP code' });
  }

  // Emergency contact phone validation
  if (formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone)) {
    errors.push({ field: 'emergencyContactPhone', message: 'Please enter a valid 10-digit phone number for emergency contact' });
  }

  // Medical information validation (optional but check format if provided)
  if (formData.medicalHistory && formData.medicalHistory.trim().length > 1000) {
    errors.push({ field: 'medicalHistory', message: 'Medical history must be less than 1000 characters' });
  }

  if (formData.allergies && formData.allergies.trim().length > 1000) {
    errors.push({ field: 'allergies', message: 'Allergies must be less than 1000 characters' });
  }

  if (formData.medications && formData.medications.trim().length > 1000) {
    errors.push({ field: 'medications', message: 'Medications must be less than 1000 characters' });
  }

  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
