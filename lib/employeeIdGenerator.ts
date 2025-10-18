import { getEmployeeByEmployeeId } from './database';

/**
 * Generate a unique employee ID for PVC ID cards
 * Format: YYYY-XXXXXX where YYYY is year and XXXXXX is 6-digit sequential number
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateEmployeeId(_department?: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Generate a 6-digit sequential number starting from 000001
  let sequenceNumber = 1;
  let employeeId: string;
  let isUnique = false;

  // Keep generating until we find a unique ID
  while (!isUnique) {
    const paddedNumber = sequenceNumber.toString().padStart(6, '0');
    employeeId = `${currentYear}-${paddedNumber}`;
    
    // Check if this ID already exists
    const existingEmployee = await getEmployeeByEmployeeId(employeeId);
    if (!existingEmployee) {
      isUnique = true;
    } else {
      sequenceNumber++;
    }

    // Safety check to prevent infinite loop
    if (sequenceNumber > 999999) {
      throw new Error('Unable to generate unique employee ID. Please contact system administrator.');
    }
  }

  return employeeId!;
}

/**
 * Generate a simple employee ID for PVC ID cards
 * Format: YYYY-XXXXXX where YYYY is year and XXXXXX is 6-digit sequential number
 */
export async function generateSimpleEmployeeId(): Promise<string> {
  return generateEmployeeId(); // Same format for all employees
}

/**
 * Validate employee ID format
 */
export function validateEmployeeIdFormat(employeeId: string): boolean {
  // Check format: YYYY-XXXXXX (year-6digits)
  const pattern = /^\d{4}-\d{6}$/;
  return pattern.test(employeeId);
}

/**
 * Extract year from employee ID
 */
export function extractYearFromEmployeeId(employeeId: string): number | null {
  if (!validateEmployeeIdFormat(employeeId)) {
    return null;
  }
  
  const parts = employeeId.split('-');
  if (parts.length !== 2) {
    return null;
  }
  
  const year = parseInt(parts[0]);
  return isNaN(year) ? null : year;
}

/**
 * Extract sequence number from employee ID
 */
export function extractSequenceFromEmployeeId(employeeId: string): number | null {
  if (!validateEmployeeIdFormat(employeeId)) {
    return null;
  }
  
  const parts = employeeId.split('-');
  if (parts.length !== 2) {
    return null;
  }
  
  const sequence = parseInt(parts[1]);
  return isNaN(sequence) ? null : sequence;
}
