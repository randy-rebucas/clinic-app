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
    },
    {
      name: 'James Martinez',
      email: 'james.martinez@clinic.com',
      password: 'MedRep123!@#',
      role: 'medrep' as const,
      department: 'Pharmacy',
      position: 'Medical Representative',
      employeeId: 'MED002',
      isActive: true
    }
  ],

  // Sample employees
  employees: [
    {
      name: 'Robert Taylor',
      email: 'robert.taylor@clinic.com',
      password: 'Employee123!@#',
      role: 'employee' as const,
      department: 'Administration',
      position: 'Administrative Assistant',
      employeeId: 'EMP001',
      isActive: true
    },
    {
      name: 'Amanda Brown',
      email: 'amanda.brown@clinic.com',
      password: 'Employee123!@#',
      role: 'employee' as const,
      department: 'IT',
      position: 'IT Support',
      employeeId: 'EMP002',
      isActive: true
    }
  ],

  // Sample patient users (User model with patient role)
  patientUsers: [
    {
      name: 'John Doe',
      email: 'john.doe@email.com',
      password: 'Patient123!@#',
      role: 'patient' as const,
      isActive: true
    },
    {
      name: 'Mary Smith',
      email: 'mary.smith@email.com',
      password: 'Patient123!@#',
      role: 'patient' as const,
      isActive: true
    },
    {
      name: 'Robert Johnson',
      email: 'robert.johnson@email.com',
      password: 'Patient123!@#',
      role: 'patient' as const,
      isActive: true
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      password: 'Patient123!@#',
      role: 'patient' as const,
      isActive: true
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      password: 'Patient123!@#',
      role: 'patient' as const,
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
        country: 'PH'
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
        country: 'PH'
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
        country: 'PH'
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
    },
    {
      patientId: 'PAT004',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '(555) 456-7890',
      dateOfBirth: new Date('1992-05-12'),
      gender: 'female' as const,
      address: {
        street: '321 Elm Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62704',
        country: 'PH'
      },
      emergencyContact: {
        name: 'Michael Davis',
        relationship: 'Brother',
        phone: '(555) 456-7891'
      },
      medicalHistory: ['Migraine'],
      allergies: ['Aspirin'],
      medications: ['Sumatriptan 50mg'],
      insurance: {
        provider: 'United Healthcare',
        policyNumber: 'UHC789123456',
        groupNumber: 'GRP004'
      }
    },
    {
      patientId: 'PAT005',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@email.com',
      phone: '(555) 567-8901',
      dateOfBirth: new Date('1988-09-25'),
      gender: 'male' as const,
      address: {
        street: '654 Maple Drive',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62705',
        country: 'PH'
      },
      emergencyContact: {
        name: 'Sarah Wilson',
        relationship: 'Sister',
        phone: '(555) 567-8902'
      },
      medicalHistory: ['GERD'],
      allergies: [],
      medications: ['Omeprazole 20mg'],
      insurance: {
        provider: 'Humana',
        policyNumber: 'HUM321654987',
        groupNumber: 'GRP005'
      }
    }
  ],

  // Sample appointments
  getSampleAppointments: (doctorIds: string[], patientIds: string[]) => {
    const today = new Date();
    const appointments = [];
    
    // Create appointments for the next 30 days
    for (let i = 0; i < 15; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(appointmentDate.getDate() + i);
      appointmentDate.setHours(0, 0, 0, 0);
      
      const patientIndex = i % patientIds.length;
      const doctorIndex = i % doctorIds.length;
      const hour = 9 + (i % 6); // 9 AM to 2 PM
      
      const startTime = new Date(appointmentDate);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(appointmentDate);
      endTime.setHours(hour, 30, 0, 0);
      
      const statuses: Array<'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'> = 
        ['scheduled', 'confirmed', 'completed', 'scheduled', 'confirmed'];
      const types: Array<'consultation' | 'follow-up' | 'emergency' | 'routine'> = 
        ['consultation', 'follow-up', 'routine', 'consultation', 'follow-up'];
      
      appointments.push({
        appointmentId: `APT${String(i + 1).padStart(3, '0')}`,
        patientId: patientIds[patientIndex],
        doctorId: doctorIds[doctorIndex],
        appointmentDate: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        type: types[i % types.length] as const,
        status: statuses[i % statuses.length] as const,
        reason: i % 2 === 0 ? 'Routine checkup' : 'Follow-up appointment',
        notes: `Appointment ${i + 1} - ${types[i % types.length]}`
      });
    }
    
    return appointments;
  },

  // Sample prescriptions
  getSamplePrescriptions: (doctorIds: string[], patientIds: string[], appointmentIds: string[]) => {
    const prescriptions = [];
    const medications = [
      [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with food', quantity: 60 }],
      [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning', quantity: 30 }],
      [{ name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime', quantity: 30 }],
      [{ name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', duration: '30 days', instructions: 'Use inhaler for asthma attacks', quantity: 1 }],
      [{ name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take before breakfast', quantity: 30 }],
      [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take with food', quantity: 21 }]
    ];
    const diagnoses = [
      'Type 2 Diabetes Mellitus',
      'Essential Hypertension',
      'Hyperlipidemia',
      'Asthma',
      'GERD',
      'Upper Respiratory Infection'
    ];
    const statuses: Array<'pending' | 'approved' | 'dispensed' | 'delivered' | 'cancelled'> = 
      ['approved', 'approved', 'dispensed', 'delivered', 'pending', 'approved'];
    
    for (let i = 0; i < Math.min(10, appointmentIds.length); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (10 - i));
      const validUntil = new Date(date);
      validUntil.setDate(validUntil.getDate() + 30);
      
      prescriptions.push({
        prescriptionId: `PRES${String(i + 1).padStart(3, '0')}`,
        patientId: patientIds[i % patientIds.length],
        doctorId: doctorIds[i % doctorIds.length],
        appointmentId: appointmentIds[i],
        medications: medications[i % medications.length],
        diagnosis: diagnoses[i % diagnoses.length],
        notes: `Prescription ${i + 1} - Follow medication instructions carefully`,
        status: statuses[i % statuses.length] as const,
        prescribedDate: date,
        validUntil: validUntil
      });
    }
    
    return prescriptions;
  },

  // Sample lab orders
  getSampleLabOrders: (doctorIds: string[], patientIds: string[], appointmentIds: string[]) => {
    const labOrders = [];
    const testSets = [
      [
        { testName: 'Complete Blood Count', testCode: 'CBC', normalRange: 'See reference ranges', unit: 'Various', status: 'pending' as const },
        { testName: 'Basic Metabolic Panel', testCode: 'BMP', normalRange: 'See reference ranges', unit: 'Various', status: 'pending' as const },
        { testName: 'Hemoglobin A1C', testCode: 'HBA1C', normalRange: '< 7.0%', unit: '%', status: 'pending' as const }
      ],
      [
        { testName: 'Lipid Panel', testCode: 'LIPID', normalRange: 'See reference ranges', unit: 'mg/dL', status: 'pending' as const }
      ],
      [
        { testName: 'Thyroid Stimulating Hormone', testCode: 'TSH', normalRange: '0.4-4.0 mIU/L', unit: 'mIU/L', status: 'pending' as const },
        { testName: 'Free T4', testCode: 'FT4', normalRange: '0.8-1.8 ng/dL', unit: 'ng/dL', status: 'pending' as const }
      ],
      [
        { testName: 'Liver Function Tests', testCode: 'LFT', normalRange: 'See reference ranges', unit: 'Various', status: 'pending' as const }
      ],
      [
        { testName: 'Urinalysis', testCode: 'UA', normalRange: 'See reference ranges', unit: 'Various', status: 'pending' as const }
      ]
    ];
    const statuses: Array<'ordered' | 'in-progress' | 'completed' | 'cancelled'> = 
      ['ordered', 'in-progress', 'completed', 'ordered', 'in-progress'];
    
    for (let i = 0; i < Math.min(8, appointmentIds.length); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (8 - i));
      
      labOrders.push({
        labOrderId: `LAB${String(i + 1).padStart(3, '0')}`,
        patientId: patientIds[i % patientIds.length],
        doctorId: doctorIds[i % doctorIds.length],
        appointmentId: appointmentIds[i],
        tests: testSets[i % testSets.length],
        status: statuses[i % statuses.length] as const,
        orderedDate: date,
        notes: `Lab order ${i + 1} - Routine testing`
      });
    }
    
    return labOrders;
  },

  // Sample invoices
  getSampleInvoices: (patientIds: string[], appointmentIds: string[], prescriptionIds: string[]) => {
    const invoices = [];
    const itemSets = [
      [
        { description: 'Office Visit - Consultation', quantity: 1, unitPrice: 150.00, totalPrice: 150.00, category: 'consultation' as const },
        { description: 'Laboratory Tests', quantity: 1, unitPrice: 75.00, totalPrice: 75.00, category: 'lab-test' as const }
      ],
      [
        { description: 'Office Visit - Follow-up', quantity: 1, unitPrice: 100.00, totalPrice: 100.00, category: 'consultation' as const }
      ],
      [
        { description: 'Office Visit - Consultation', quantity: 1, unitPrice: 150.00, totalPrice: 150.00, category: 'consultation' as const },
        { description: 'Prescription Medications', quantity: 1, unitPrice: 50.00, totalPrice: 50.00, category: 'medication' as const }
      ],
      [
        { description: 'Office Visit - Routine', quantity: 1, unitPrice: 120.00, totalPrice: 120.00, category: 'consultation' as const },
        { description: 'Laboratory Tests', quantity: 1, unitPrice: 85.00, totalPrice: 85.00, category: 'lab-test' as const }
      ],
      [
        { description: 'Office Visit - Consultation', quantity: 1, unitPrice: 150.00, totalPrice: 150.00, category: 'consultation' as const }
      ]
    ];
    const statuses: Array<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'> = 
      ['sent', 'paid', 'sent', 'overdue', 'paid'];
    
    for (let i = 0; i < Math.min(10, appointmentIds.length); i++) {
      const subtotal = itemSets[i % itemSets.length].reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.08;
      const totalAmount = subtotal + taxAmount;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30 - (i * 3));
      
      const invoice: any = {
        invoiceId: `INV${String(i + 1).padStart(3, '0')}`,
        patientId: patientIds[i % patientIds.length],
        appointmentId: appointmentIds[i],
        items: itemSets[i % itemSets.length],
        subtotal,
        taxRate: 0.08,
        taxAmount,
        discountAmount: 0.00,
        totalAmount,
        status: statuses[i % statuses.length] as const,
        dueDate,
        notes: `Invoice ${i + 1} - Payment due within 30 days`
      };
      
      if (i < prescriptionIds.length) {
        invoice.prescriptionId = prescriptionIds[i];
      }
      
      if (statuses[i % statuses.length] === 'paid') {
        invoice.paidDate = new Date();
        invoice.paymentMethod = i % 2 === 0 ? 'card' : 'cash';
      }
      
      invoices.push(invoice);
    }
    
    return invoices;
  },

  // Sample payments
  getSamplePayments: (patientIds: string[], invoiceIds: string[], userIds: string[]) => {
    const payments = [];
    const paymentMethods: Array<'card' | 'cash' | 'check' | 'bank-transfer'> = 
      ['card', 'cash', 'card', 'check', 'bank-transfer'];
    
    // Create payments for paid invoices
    for (let i = 0; i < Math.min(5, invoiceIds.length); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (5 - i));
      
      payments.push({
        paymentId: `PAY${String(i + 1).padStart(3, '0')}`,
        invoiceId: invoiceIds[i],
        patientId: patientIds[i % patientIds.length],
        amount: 100.00 + (i * 25), // Varying amounts
        paymentMethod: paymentMethods[i % paymentMethods.length] as const,
        paymentDate: date,
        reference: `TXN${String(123456789 + i).padStart(12, '0')}`,
        notes: `${paymentMethods[i % paymentMethods.length]} payment processed`,
        processedBy: userIds[0] // Admin user
      });
    }
    
    return payments;
  },

  // Sample queue entries
  getSampleQueueEntries: (patientIds: string[], appointmentIds: string[], doctorIds: string[]) => {
    const queueEntries = [];
    const priorities: Array<'low' | 'normal' | 'high' | 'emergency'> = 
      ['normal', 'normal', 'high', 'low', 'emergency', 'normal'];
    const types: Array<'consultation' | 'follow-up' | 'emergency' | 'routine'> = 
      ['consultation', 'follow-up', 'routine', 'consultation', 'emergency', 'follow-up'];
    const statuses: Array<'waiting' | 'in-progress' | 'completed' | 'cancelled'> = 
      ['waiting', 'in-progress', 'completed', 'waiting', 'in-progress', 'completed'];
    
    for (let i = 0; i < Math.min(12, appointmentIds.length); i++) {
      queueEntries.push({
        queueId: `QUE${String(i + 1).padStart(3, '0')}`,
        patientId: patientIds[i % patientIds.length],
        appointmentId: appointmentIds[i],
        priority: priorities[i % priorities.length] as const,
        type: types[i % types.length] as const,
        reason: `Queue entry ${i + 1} - ${types[i % types.length]}`,
        assignedDoctorId: doctorIds[i % doctorIds.length],
        status: statuses[i % statuses.length] as const,
        estimatedWaitTime: 10 + (i * 5)
      });
    }
    
    return queueEntries;
  },

  // Sample deliveries
  getSampleDeliveries: (
    prescriptionIds: string[], 
    patientIds: string[], 
    patientData: Array<{ firstName: string; lastName: string; phone?: string; address?: { street: string; city: string; state: string; zipCode: string; country: string } }>,
    medRepIds: string[]
  ) => {
    const deliveries = [];
    const statuses: Array<'scheduled' | 'in-transit' | 'delivered' | 'cancelled'> = 
      ['scheduled', 'in-transit', 'delivered', 'scheduled', 'in-transit', 'delivered'];
    
    for (let i = 0; i < Math.min(8, prescriptionIds.length); i++) {
      const patientIndex = i % patientData.length;
      const patient = patientData[patientIndex];
      const scheduledTime = new Date();
      scheduledTime.setDate(scheduledTime.getDate() + i + 1);
      scheduledTime.setHours(10 + (i % 6), 0, 0, 0);
      
      deliveries.push({
        prescriptionId: prescriptionIds[i],
        patientId: patientIds[patientIndex],
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phone || '(555) 000-0000',
        deliveryAddress: patient.address || {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'PH'
        },
        scheduledTime,
        medRepId: medRepIds[i % medRepIds.length],
        status: statuses[i % statuses.length] as const,
        notes: `Delivery ${i + 1} - Please deliver during business hours`
      });
    }
    
    return deliveries;
  }
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
