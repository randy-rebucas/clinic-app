// Input validation utilities for API routes

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
    return { isValid: false, errors };
  }
  
  if (email.length > 254) {
    errors.push('Email is too long');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateObjectId(id: string): ValidationResult {
  const errors: string[] = [];
  
  if (!id || typeof id !== 'string') {
    errors.push('ID is required and must be a string');
    return { isValid: false, errors };
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    errors.push('Invalid ID format');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateDate(dateString: string): ValidationResult {
  const errors: string[] = [];
  
  if (!dateString || typeof dateString !== 'string') {
    errors.push('Date is required and must be a string');
    return { isValid: false, errors };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .substring(0, maxLength) // Limit length
    .trim();
}

export function validateRequiredFields(data: Record<string, unknown>, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${field} is required`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
