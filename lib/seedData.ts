import { v4 as uuidv4 } from 'uuid';

// Sample data for seeding the application
export const seedData = {
  // Admin user data
  adminUser: {
    name: 'System Administrator',
    email: 'admin@clinic.com',
    password: 'Admin123!@#',
    role: 'admin' as const,
    department: 'Administration',
    position: 'System Administrator',
    employeeId: 'ADM001',
    isActive: true
  },

  // Sample doctors
  doctors: [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      password: 'Doctor123!@#',
      role: 'doctor' as const,
      department: 'Internal Medicine',
      position: 'Senior Physician',
      employeeId: 'DOC001',
      specialization: 'Internal Medicine',
      licenseNumber: 'MD123456',
      isActive: true
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@clinic.com',
      password: 'Doctor123!@#',
      role: 'doctor' as const,
      department: 'Cardiology',
      position: 'Cardiologist',
      employeeId: 'DOC002',
      specialization: 'Cardiology',
      licenseNumber: 'MD789012',
      isActive: true
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@clinic.com',
      password: 'Doctor123!@#',
      role: 'doctor' as const,
      department: 'Pediatrics',
      position: 'Pediatrician',
      employeeId: 'DOC003',
      specialization: 'Pediatrics',
      licenseNumber: 'MD345678',
      isActive: true
    }
  ],

  // Sample receptionists
  receptionists: [
    {
      name: 'Jennifer Smith',
      email: 'jennifer.smith@clinic.com',
      password: 'Reception123!@#',
      role: 'receptionist' as const,
      department: 'Front Office',
      position: 'Senior Receptionist',
      employeeId: 'REC001',
      isActive: true
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@clinic.com',
      password: 'Reception123!@#',
      role: 'receptionist' as const,
      department: 'Front Office',
      position: 'Receptionist',
      employeeId: 'REC002',
      isActive: true
    }
  ],

  // Sample medical representatives
  medreps: [
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@clinic.com',
      password: 'MedRep123!@#',
      role: 'medrep' as const,
      department: 'Pharmacy',
      position: 'Medical Representative',
      employeeId: 'MED001',
      isActive: true
    }
  ],

  // Sample patients
  patients: [
    {
      patientId: 'PAT001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male' as const,
      address: {
        street: '123 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '(555) 123-4568'
      },
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg'],
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001'
      }
    },
    {
      patientId: 'PAT002',
      firstName: 'Mary',
      lastName: 'Smith',
      email: 'mary.smith@email.com',
      phone: '(555) 234-5678',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'female' as const,
      address: {
        street: '456 Oak Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Robert Smith',
        relationship: 'Father',
        phone: '(555) 234-5679'
      },
      medicalHistory: ['Asthma'],
      allergies: ['Dust mites', 'Pollen'],
      medications: ['Albuterol inhaler'],
      insurance: {
        provider: 'Aetna',
        policyNumber: 'AET987654321',
        groupNumber: 'GRP002'
      }
    },
    {
      patientId: 'PAT003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@email.com',
      phone: '(555) 345-6789',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'male' as const,
      address: {
        street: '789 Pine Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Susan Johnson',
        relationship: 'Wife',
        phone: '(555) 345-6790'
      },
      medicalHistory: ['High Cholesterol'],
      allergies: [],
      medications: ['Atorvastatin 20mg'],
      insurance: {
        provider: 'Cigna',
        policyNumber: 'CIG456789123',
        groupNumber: 'GRP003'
      }
    }
  ],

  // Sample appointments
  getSampleAppointments: (doctorIds: string[], patientIds: string[]) => [
    {
      appointmentId: 'APT001',
      patientId: patientIds[0],
      doctorId: doctorIds[0],
      appointmentDate: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T09:30:00'),
      type: 'consultation' as const,
      status: 'scheduled' as const,
      reason: 'Annual checkup',
      notes: 'Patient requests routine physical examination'
    },
    {
      appointmentId: 'APT002',
      patientId: patientIds[1],
      doctorId: doctorIds[1],
      appointmentDate: new Date('2024-01-16'),
      startTime: new Date('2024-01-16T10:00:00'),
      endTime: new Date('2024-01-16T10:30:00'),
      type: 'follow-up' as const,
      status: 'scheduled' as const,
      reason: 'Follow-up on blood pressure medication',
      notes: 'Patient reports good compliance with medication'
    },
    {
      appointmentId: 'APT003',
      patientId: patientIds[2],
      doctorId: doctorIds[2],
      appointmentDate: new Date('2024-01-17'),
      startTime: new Date('2024-01-17T14:00:00'),
      endTime: new Date('2024-01-17T14:30:00'),
      type: 'consultation' as const,
      status: 'scheduled' as const,
      reason: 'Cholesterol management',
      notes: 'Review lab results and adjust medication if needed'
    }
  ],

  // Sample prescriptions
  getSamplePrescriptions: (doctorIds: string[], patientIds: string[], appointmentIds: string[]) => [
    {
      prescriptionId: 'PRES001',
      patientId: patientIds[0],
      doctorId: doctorIds[0],
      appointmentId: appointmentIds[0],
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with food',
          quantity: 60
        }
      ],
      diagnosis: 'Type 2 Diabetes Mellitus',
      notes: 'Continue current medication, monitor blood glucose levels',
      status: 'approved' as const,
      prescribedDate: new Date('2024-01-15'),
      validUntil: new Date('2024-02-15')
    },
    {
      prescriptionId: 'PRES002',
      patientId: patientIds[1],
      doctorId: doctorIds[1],
      appointmentId: appointmentIds[1],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning',
          quantity: 30
        }
      ],
      diagnosis: 'Essential Hypertension',
      notes: 'Monitor blood pressure weekly',
      status: 'approved' as const,
      prescribedDate: new Date('2024-01-16'),
      validUntil: new Date('2024-02-16')
    }
  ],

  // Sample lab orders
  getSampleLabOrders: (doctorIds: string[], patientIds: string[], appointmentIds: string[]) => [
    {
      labOrderId: 'LAB001',
      patientId: patientIds[0],
      doctorId: doctorIds[0],
      appointmentId: appointmentIds[0],
      tests: [
        {
          testName: 'Complete Blood Count',
          testCode: 'CBC',
          normalRange: 'See reference ranges',
          unit: 'Various',
          status: 'pending' as const
        },
        {
          testName: 'Basic Metabolic Panel',
          testCode: 'BMP',
          normalRange: 'See reference ranges',
          unit: 'Various',
          status: 'pending' as const
        },
        {
          testName: 'Hemoglobin A1C',
          testCode: 'HBA1C',
          normalRange: '< 7.0%',
          unit: '%',
          status: 'pending' as const
        }
      ],
      status: 'ordered' as const,
      orderedDate: new Date('2024-01-15'),
      notes: 'Routine diabetes monitoring'
    },
    {
      labOrderId: 'LAB002',
      patientId: patientIds[1],
      doctorId: doctorIds[1],
      appointmentId: appointmentIds[1],
      tests: [
        {
          testName: 'Lipid Panel',
          testCode: 'LIPID',
          normalRange: 'See reference ranges',
          unit: 'mg/dL',
          status: 'pending' as const
        }
      ],
      status: 'ordered' as const,
      orderedDate: new Date('2024-01-16'),
      notes: 'Cholesterol monitoring'
    }
  ],

  // Sample invoices
  getSampleInvoices: (patientIds: string[], appointmentIds: string[]) => [
    {
      invoiceId: 'INV001',
      patientId: patientIds[0],
      appointmentId: appointmentIds[0],
      items: [
        {
          description: 'Office Visit - Consultation',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00,
          category: 'consultation' as const
        },
        {
          description: 'Laboratory Tests',
          quantity: 1,
          unitPrice: 75.00,
          totalPrice: 75.00,
          category: 'lab-test' as const
        }
      ],
      subtotal: 225.00,
      taxRate: 0.08,
      taxAmount: 18.00,
      discountAmount: 0.00,
      totalAmount: 243.00,
      status: 'sent' as const,
      dueDate: new Date('2024-02-15'),
      notes: 'Payment due within 30 days'
    },
    {
      invoiceId: 'INV002',
      patientId: patientIds[1],
      appointmentId: appointmentIds[1],
      items: [
        {
          description: 'Office Visit - Follow-up',
          quantity: 1,
          unitPrice: 100.00,
          totalPrice: 100.00,
          category: 'consultation' as const
        }
      ],
      subtotal: 100.00,
      taxRate: 0.08,
      taxAmount: 8.00,
      discountAmount: 0.00,
      totalAmount: 108.00,
      status: 'paid' as const,
      dueDate: new Date('2024-02-16'),
      paidDate: new Date('2024-01-16'),
      paymentMethod: 'card' as const,
      notes: 'Payment received'
    }
  ],

  // Sample payments
  getSamplePayments: (patientIds: string[], invoiceIds: string[], userIds: string[]) => [
    {
      paymentId: 'PAY001',
      invoiceId: invoiceIds[1],
      patientId: patientIds[1],
      amount: 108.00,
      paymentMethod: 'card' as const,
      paymentDate: new Date('2024-01-16'),
      reference: 'TXN123456789',
      notes: 'Credit card payment processed',
      processedBy: userIds[0] // Admin user
    }
  ],

  // Sample queue entries
  getSampleQueueEntries: (patientIds: string[], appointmentIds: string[], doctorIds: string[]) => [
    {
      queueId: 'QUE001',
      patientId: patientIds[0],
      appointmentId: appointmentIds[0],
      priority: 'normal' as const,
      type: 'consultation' as const,
      reason: 'Annual checkup',
      assignedDoctorId: doctorIds[0],
      status: 'waiting' as const,
      estimatedWaitTime: 15
    },
    {
      queueId: 'QUE002',
      patientId: patientIds[1],
      appointmentId: appointmentIds[1],
      priority: 'normal' as const,
      type: 'follow-up' as const,
      reason: 'Follow-up on blood pressure medication',
      assignedDoctorId: doctorIds[1],
      status: 'waiting' as const,
      estimatedWaitTime: 10
    }
  ]
};

// Helper function to generate unique IDs
export const generateId = (prefix: string): string => {
  return `${prefix}${uuidv4().substring(0, 8).toUpperCase()}`;
};

// Helper function to create date with time offset
export const createDateWithOffset = (days: number, hours: number = 0, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};
