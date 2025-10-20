import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'medrep', 'patient', 'employee']),
  department: z.string().optional(),
  position: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Patient validation schemas
export const patientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
  }).optional(),
});

// Appointment validation schemas
export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  type: z.enum(['consultation', 'follow-up', 'emergency', 'routine']),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

// Prescription validation schemas
export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().optional(),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});

// Queue validation schemas
export const queueSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'emergency']),
  type: z.enum(['consultation', 'follow-up', 'emergency', 'routine']),
  reason: z.string().min(1, 'Reason is required'),
  assignedDoctorId: z.string().optional(),
  estimatedWaitTime: z.number().optional(),
});

// Billing validation schemas
export const billingItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  totalPrice: z.number().min(0, 'Total price must be non-negative'),
  category: z.enum(['consultation', 'medication', 'lab-test', 'procedure', 'other']),
});

export const invoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  prescriptionId: z.string().optional(),
  items: z.array(billingItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'insurance', 'bank-transfer']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().min(1, 'Processed by is required'),
});

// Lab validation schemas
export const labTestSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  testCode: z.string().min(1, 'Test code is required'),
  normalRange: z.string().optional(),
  unit: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  status: z.enum(['pending', 'normal', 'abnormal', 'critical']),
  notes: z.string().optional(),
});

export const labOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().optional(),
  tests: z.array(labTestSchema).min(1, 'At least one test is required'),
  notes: z.string().optional(),
});

// Search validation schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).optional(),
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"],
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Utility functions for validation
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}

export function validatePartialData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: Partial<T>;
  errors?: string[];
} {
  try {
    const validatedData = (schema as z.ZodType<T> & { partial: () => z.ZodType<Partial<T>> }).partial().parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}