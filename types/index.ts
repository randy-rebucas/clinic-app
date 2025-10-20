export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'medrep' | 'patient' | 'employee';
  department?: string;
  position?: string;
  profilePicture?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Clinic-specific interfaces
export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };
  diagnosis?: string;
  treatment?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }[];
  diagnosis: string;
  notes?: string;
  status: 'pending' | 'approved' | 'dispensed' | 'delivered' | 'cancelled';
  prescribedDate: Date;
  validUntil: Date;
  deliveredBy?: string;
  deliveredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Queue {
  id: string;
  queueId: string;
  patientId: string;
  appointmentId?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  assignedDoctorId?: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  estimatedWaitTime?: number;
  actualWaitTime?: number;
  calledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  patientId: string;
  appointmentId?: string;
  prescriptionId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: 'consultation' | 'medication' | 'lab-test' | 'procedure' | 'other';
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  processedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabOrder {
  id: string;
  labOrderId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  tests: {
    testName: string;
    testCode: string;
    normalRange?: string;
    unit?: string;
    value?: string | number;
    status: 'pending' | 'normal' | 'abnormal' | 'critical';
    notes?: string;
  }[];
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  orderedDate: Date;
  completedDate?: Date;
  labTechnician?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}