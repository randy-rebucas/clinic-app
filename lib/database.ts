import connectDB from './mongodb';

// Re-export connectDB for other modules
export { connectDB };
import { Types } from 'mongoose';
import { User, IUser } from './models/User';
import { Patient, IPatient } from './models/Patient';
import { Appointment, IAppointment } from './models/Appointment';
import { Prescription, IPrescription } from './models/Prescription';
import { Queue, IQueue } from './models/Queue';
import { Invoice, Payment, IInvoice, IPayment } from './models/Billing';
import { LabOrder, ILabOrder } from './models/Lab';
import { ApplicationSettings, IApplicationSettings } from './models/ApplicationSettings';
import { Delivery, IDelivery } from './models/Delivery';

// User Management (auth-only)
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'medrep' | 'patient' | 'employee';
  department?: string;
  position?: string;
}) => {
  await connectDB();
  const user = new User(userData);
  const savedUser = await user.save();
  return savedUser._id.toString();
};

export const getUser = async (userId: string): Promise<IUser | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (User as any).findById(userId);
  return user;
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (User as any).findOne({ email });
  return user;
};

// Patient Management
export const createPatient = async (patientData: {
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
}) => {
  await connectDB();
  const patient = new Patient(patientData);
  const savedPatient = await patient.save();
  return savedPatient._id.toString();
};

export const getPatient = async (patientId: string): Promise<IPatient | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(patientId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patient = await (Patient as any).findById(patientId);
  return patient;
};

export const getPatientByPatientId = async (patientId: string): Promise<IPatient | null> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patient = await (Patient as any).findOne({ patientId });
  return patient;
};

export const getAllPatients = async (): Promise<IPatient[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patients = await (Patient as any).find({}).sort({ createdAt: -1 });
  return patients;
};

export const searchPatients = async (query: string): Promise<IPatient[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patients = await (Patient as any).find({
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { patientId: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }).limit(20);
  return patients;
};

// Appointment Management
export const createAppointment = async (appointmentData: {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  notes?: string;
}) => {
  await connectDB();
  const appointment = new Appointment(appointmentData);
  const savedAppointment = await appointment.save();
  return savedAppointment._id.toString();
};

export const getAppointment = async (appointmentId: string): Promise<IAppointment | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(appointmentId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appointment = await (Appointment as any).findById(appointmentId);
  return appointment;
};

export const getAppointmentsByDoctor = async (doctorId: string, date?: Date): Promise<IAppointment[]> => {
  await connectDB();
  const query: { doctorId: string; appointmentDate?: { $gte: Date; $lte: Date } } = { doctorId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appointments = await (Appointment as any).find(query).sort({ startTime: 1 });
  return appointments;
};

// Queue Management
export const addToQueue = async (queueData: {
  queueId: string;
  patientId: string;
  appointmentId?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  reason: string;
  assignedDoctorId?: string;
  estimatedWaitTime?: number;
}) => {
  await connectDB();
  const queue = new Queue(queueData);
  const savedQueue = await queue.save();
  return savedQueue._id.toString();
};

export const getQueue = async (status?: string): Promise<IQueue[]> => {
  await connectDB();
  const query: { status?: string } = {};
  if (status) {
    query.status = status;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue = await (Queue as any).find(query).sort({ priority: -1, createdAt: 1 });
  return queue;
};

// Enhanced Queue Functions
export const updateQueueStatus = async (queueId: string, status: string, assignedDoctorId?: string, notes?: string) => {
  await connectDB();
  const updateData: { status: string; assignedDoctorId?: string; notes?: string; startedAt?: Date; completedAt?: Date; calledAt?: Date } = { status };
  
  if (assignedDoctorId) updateData.assignedDoctorId = assignedDoctorId;
  if (notes) updateData.notes = notes;
  
  // Set timestamps based on status
  if (status === 'in-progress') {
    updateData.startedAt = new Date();
  } else if (status === 'completed') {
    updateData.completedAt = new Date();
  } else if (status === 'called') {
    updateData.calledAt = new Date();
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue = await (Queue as any).findByIdAndUpdate(queueId, updateData, { new: true });
  return queue;
};

export const getQueueByDoctor = async (doctorId: string, status?: string): Promise<IQueue[]> => {
  await connectDB();
  const query: { assignedDoctorId: string; status?: string } = { assignedDoctorId: doctorId };
  if (status) {
    query.status = status;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue = await (Queue as any).find(query).sort({ priority: -1, createdAt: 1 });
  return queue;
};

export const getQueueByPatient = async (patientId: string): Promise<IQueue[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue = await (Queue as any).find({ patientId }).sort({ createdAt: -1 });
  return queue;
};

export const getQueueStats = async () => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total = await (Queue as any).countDocuments();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const waiting = await (Queue as any).countDocuments({ status: 'waiting' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inProgress = await (Queue as any).countDocuments({ status: 'in-progress' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completed = await (Queue as any).countDocuments({ status: 'completed' });
  
  return {
    total,
    waiting,
    inProgress,
    completed,
    averageWaitTime: 0 // This would be calculated based on actual wait times
  };
};

export const assignDoctorToQueue = async (queueId: string, doctorId: string) => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue = await (Queue as any).findByIdAndUpdate(
    queueId, 
    { assignedDoctorId: doctorId }, 
    { new: true }
  );
  return queue;
};

// Billing Management
export const createInvoice = async (invoiceData: {
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
  dueDate: Date;
  notes?: string;
}) => {
  await connectDB();
  const invoice = new Invoice(invoiceData);
  const savedInvoice = await invoice.save();
  return savedInvoice._id.toString();
};

export const getInvoice = async (invoiceId: string): Promise<IInvoice | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(invoiceId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = await (Invoice as any).findById(invoiceId);
  return invoice;
};

export const getInvoicesByPatient = async (patientId: string): Promise<IInvoice[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = await (Invoice as any).find({ patientId }).sort({ createdAt: -1 });
  return invoices;
};

export const createPayment = async (paymentData: {
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  reference?: string;
  notes?: string;
  processedBy: string;
}) => {
  await connectDB();
  const payment = new Payment(paymentData);
  const savedPayment = await payment.save();
  return savedPayment._id.toString();
};

// Prescription Management
export const createPrescription = async (prescriptionData: {
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
  validUntil: Date;
}) => {
  await connectDB();
  const prescription = new Prescription(prescriptionData);
  const savedPrescription = await prescription.save();
  return savedPrescription._id.toString();
};

export const getPrescription = async (prescriptionId: string): Promise<IPrescription | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(prescriptionId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prescription = await (Prescription as any).findById(prescriptionId);
  return prescription;
};

// Lab Management
export const createLabOrder = async (labOrderData: {
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
  notes?: string;
}) => {
  await connectDB();
  const labOrder = new LabOrder(labOrderData);
  const savedLabOrder = await labOrder.save();
  return savedLabOrder._id.toString();
};

export const getLabOrder = async (labOrderId: string): Promise<ILabOrder | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(labOrderId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrder = await (LabOrder as any).findById(labOrderId);
  return labOrder;
};

export const getLabOrdersByPatient = async (patientId: string): Promise<ILabOrder[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrders = await (LabOrder as any).find({ patientId }).sort({ orderedDate: -1 });
  return labOrders;
};

// Enhanced Lab Functions
export const updateLabOrderStatus = async (labOrderId: string, status: string, completedDate?: Date, labTechnician?: string) => {
  await connectDB();
  const updateData: { status: string; completedDate?: Date; labTechnician?: string } = { status };
  if (completedDate) updateData.completedDate = completedDate;
  if (labTechnician) updateData.labTechnician = labTechnician;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrder = await (LabOrder as any).findByIdAndUpdate(labOrderId, updateData, { new: true });
  return labOrder;
};

export const updateLabTestResult = async (labOrderId: string, testIndex: number, resultData: {
  value?: string | number;
  status: 'pending' | 'normal' | 'abnormal' | 'critical';
  notes?: string;
}) => {
  await connectDB();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrder = await (LabOrder as any).findById(labOrderId);
  if (!labOrder) return null;
  
  if (labOrder.tests && labOrder.tests[testIndex]) {
    labOrder.tests[testIndex] = { ...labOrder.tests[testIndex], ...resultData };
    
    // Update overall status based on test results
    // const hasCritical = labOrder.tests.some((test: { status: string }) => test.status === 'critical');
    // const hasAbnormal = labOrder.tests.some((test: { status: string }) => test.status === 'abnormal');
    const allCompleted = labOrder.tests.every((test: { status: string }) => test.status !== 'pending');
    
    if (allCompleted) {
      labOrder.status = 'completed';
      labOrder.completedDate = new Date();
    }
    
    await labOrder.save();
  }
  
  return labOrder;
};

export const getLabOrdersByStatus = async (status: string): Promise<ILabOrder[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrders = await (LabOrder as any).find({ status }).sort({ orderedDate: -1 });
  return labOrders;
};

export const getLabOrdersByDoctor = async (doctorId: string): Promise<ILabOrder[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrders = await (LabOrder as any).find({ doctorId }).sort({ orderedDate: -1 });
  return labOrders;
};

export const getLabOrdersRequiringFollowUp = async (): Promise<ILabOrder[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrders = await (LabOrder as any).find({ 
    followUpRequired: true,
    followUpDate: { $lte: new Date() }
  }).sort({ followUpDate: 1 });
  return labOrders;
};

export const getAllLabOrders = async (): Promise<ILabOrder[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labOrders = await (LabOrder as any).find({}).sort({ orderedDate: -1 });
  return labOrders;
};

// Enhanced Billing Functions
export const updateInvoiceStatus = async (invoiceId: string, status: string, paymentMethod?: string, paidDate?: Date) => {
  await connectDB();
  const updateData: { status: string; paymentMethod?: string; paidDate?: Date } = { status };
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (paidDate) updateData.paidDate = paidDate;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = await (Invoice as any).findByIdAndUpdate(invoiceId, updateData, { new: true });
  return invoice;
};

export const getInvoicesByStatus = async (status: string): Promise<IInvoice[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = await (Invoice as any).find({ status }).sort({ createdAt: -1 });
  return invoices;
};

export const getPaymentsByInvoice = async (invoiceId: string): Promise<IPayment[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = await (Payment as any).find({ invoiceId }).sort({ paymentDate: -1 });
  return payments;
};

export const getPaymentsByPatient = async (patientId: string): Promise<IPayment[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = await (Payment as any).find({ patientId }).sort({ paymentDate: -1 });
  return payments;
};

export const getAllPayments = async (): Promise<IPayment[]> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = await (Payment as any).find({}).sort({ paymentDate: -1 });
  return payments;
};

export const getPayment = async (paymentId: string): Promise<IPayment | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(paymentId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payment = await (Payment as any).findById(paymentId);
  return payment;
};

export const getBillingSummary = async (patientId: string) => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = await (Invoice as any).find({ patientId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = await (Payment as any).find({ patientId });
  
  const totalInvoiced = invoices.reduce((sum: number, inv: { totalAmount: number }) => sum + inv.totalAmount, 0);
  const totalPaid = payments.reduce((sum: number, pay: { amount: number }) => sum + pay.amount, 0);
  const outstanding = totalInvoiced - totalPaid;
  
  return {
    totalInvoiced,
    totalPaid,
    outstanding,
    invoiceCount: invoices.length,
    paymentCount: payments.length
  };
};

export const getOverallBillingSummary = async () => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = await (Invoice as any).find({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = await (Payment as any).find({});
  
  const totalInvoiced = invoices.reduce((sum: number, inv: { totalAmount: number }) => sum + inv.totalAmount, 0);
  const totalPaid = payments.reduce((sum: number, pay: { amount: number }) => sum + pay.amount, 0);
  const outstanding = totalInvoiced - totalPaid;
  
  return {
    totalInvoiced,
    totalPaid,
    outstanding,
    invoiceCount: invoices.length,
    paymentCount: payments.length
  };
};

// Application Settings Management
export const getApplicationSettings = async (): Promise<IApplicationSettings | null> => {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ApplicationSettings as any).findOne();
  return settings;
};

export const createApplicationSettings = async (settingsData: Partial<IApplicationSettings>): Promise<string> => {
  await connectDB();
  
  // Check if settings already exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingSettings = await (ApplicationSettings as any).findOne();
  if (existingSettings) {
    throw new Error('Application settings already exist. Use updateApplicationSettings instead.');
  }
  
  const settings = new ApplicationSettings(settingsData);
  const savedSettings = await settings.save();
  return savedSettings._id.toString();
};

export const updateApplicationSettings = async (settingsData: Partial<IApplicationSettings>): Promise<IApplicationSettings | null> => {
  await connectDB();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ApplicationSettings as any).findOneAndUpdate(
    {},
    { ...settingsData, lastUpdated: new Date() },
    { new: true, upsert: true }
  );
  return settings;
};

export const initializeApplicationSettings = async (
  updatedBy: string, 
  customSettings?: {
    clinicName: string;
    clinicAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    clinicPhone: string;
    clinicEmail: string;
    clinicWebsite?: string;
    businessHours: {
      monday: { open: string; close: string; isOpen: boolean };
      tuesday: { open: string; close: string; isOpen: boolean };
      wednesday: { open: string; close: string; isOpen: boolean };
      thursday: { open: string; close: string; isOpen: boolean };
      friday: { open: string; close: string; isOpen: boolean };
      saturday: { open: string; close: string; isOpen: boolean };
      sunday: { open: string; close: string; isOpen: boolean };
    };
    timezone: string;
    currency: string;
  }
): Promise<IApplicationSettings> => {
  await connectDB();
  
  const defaultSettings = {
    clinicName: customSettings?.clinicName || 'MediNext',
    clinicAddress: customSettings?.clinicAddress || {
      street: '123 Medical Center Ave',
      city: 'Manila',
      state: 'NCR',
      zipCode: '1000',
      country: 'PH'
    },
    clinicPhone: customSettings?.clinicPhone || '+63 2 1234 5678',
    clinicEmail: customSettings?.clinicEmail || 'info@clinic.com',
    clinicWebsite: customSettings?.clinicWebsite,
    businessHours: customSettings?.businessHours || {
      monday: { open: '08:00', close: '17:00', isOpen: true },
      tuesday: { open: '08:00', close: '17:00', isOpen: true },
      wednesday: { open: '08:00', close: '17:00', isOpen: true },
      thursday: { open: '08:00', close: '17:00', isOpen: true },
      friday: { open: '08:00', close: '17:00', isOpen: true },
      saturday: { open: '09:00', close: '13:00', isOpen: true },
      sunday: { open: '09:00', close: '13:00', isOpen: false }
    },
    appointmentSettings: {
      defaultDuration: 30,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 2,
      allowOnlineBooking: true,
      requireConfirmation: true,
      autoConfirmAppointments: false,
      reminderHours: [24, 2]
    },
    billingSettings: {
      currency: customSettings?.currency || 'PHP',
      taxRate: 0.12,
      defaultPaymentTerms: 30,
      lateFeeRate: 0.02,
      allowPartialPayments: true,
      requireInsuranceVerification: false
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
      paymentReminders: true,
      labResultNotifications: true,
      prescriptionReadyNotifications: true
    },
    systemSettings: {
      timezone: customSettings?.timezone || 'Asia/Beijing',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h' as const,
      language: 'en',
      maxFileUploadSize: 5,
      sessionTimeout: 480,
      requireTwoFactorAuth: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    features: {
      patientPortal: true,
      onlineAppointments: true,
      prescriptionManagement: true,
      labResults: true,
      billingManagement: true,
      inventoryManagement: false,
      reporting: true,
      auditLogs: true
    },
    integrations: {
      emailService: { provider: 'smtp', configured: false },
      smsService: { provider: 'twilio', configured: false },
      paymentGateway: { provider: 'stripe', configured: false },
      labIntegration: { provider: 'manual', configured: false }
    },
    version: '1.0.0',
    updatedBy,
    isInitialized: true
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ApplicationSettings as any).findOneAndUpdate(
    {},
    defaultSettings,
    { new: true, upsert: true }
  );
  
  return settings;
};

// Delivery Management
export const createDelivery = async (deliveryData: {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  scheduledTime: Date;
  medRepId: string;
  notes?: string;
}) => {
  await connectDB();
  const delivery = new Delivery(deliveryData);
  const savedDelivery = await delivery.save();
  return savedDelivery._id.toString();
};

export const getDelivery = async (deliveryId: string): Promise<IDelivery | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(deliveryId)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delivery = await (Delivery as any).findById(deliveryId);
  return delivery;
};

export const getDeliveries = async (filters: {
  medRepId?: string;
  status?: string;
  patientId?: string;
}): Promise<IDelivery[]> => {
  await connectDB();
  const query: { medRepId?: string; status?: string; patientId?: string } = {};
  
  if (filters.medRepId) {
    query.medRepId = filters.medRepId;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.patientId) {
    query.patientId = filters.patientId;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliveries = await (Delivery as any).find(query).sort({ scheduledTime: -1 });
  return deliveries;
};

export const updateDelivery = async (deliveryId: string, updateData: {
  status?: string;
  notes?: string;
  actualDeliveryTime?: Date;
}): Promise<IDelivery | null> => {
  await connectDB();
  if (!Types.ObjectId.isValid(deliveryId)) {
    return null;
  }
  
  const updateFields: { status?: string; notes?: string; actualDeliveryTime?: Date; updatedAt: Date } = {
    ...updateData,
    updatedAt: new Date()
  };
  
  // If status is delivered, set actual delivery time
  if (updateData.status === 'delivered' && !updateData.actualDeliveryTime) {
    updateFields.actualDeliveryTime = new Date();
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delivery = await (Delivery as any).findByIdAndUpdate(deliveryId, updateFields, { new: true });
  return delivery;
};

export const deleteDelivery = async (deliveryId: string): Promise<boolean> => {
  await connectDB();
  if (!Types.ObjectId.isValid(deliveryId)) {
    return false;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (Delivery as any).findByIdAndDelete(deliveryId);
  return !!result;
};

// Database Reset Functions
export const resetDatabase = async (): Promise<{
  success: boolean;
  message: string;
  deletedCounts: Record<string, number>;
  errors?: string[];
}> => {
  const errors: string[] = [];
  const deletedCounts: Record<string, number> = {};
  
  try {
    await connectDB();
    console.log('Starting database reset...');
    
    // Delete all collections in the correct order (respecting foreign key relationships)
    const collections = [
      { name: 'deliveries', model: Delivery },
      { name: 'payments', model: Payment },
      { name: 'invoices', model: Invoice },
      { name: 'laborders', model: LabOrder },
      { name: 'prescriptions', model: Prescription },
      { name: 'appointments', model: Appointment },
      { name: 'queues', model: Queue },
      { name: 'patients', model: Patient },
      { name: 'users', model: User },
      { name: 'applicationsettings', model: ApplicationSettings },
      { name: 'auditlogs', model: require('./models/AuditLog').AuditLog }
    ];
    
    for (const collection of collections) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (collection.model as any).deleteMany({});
        deletedCounts[collection.name] = result.deletedCount || 0;
        console.log(`Deleted ${result.deletedCount || 0} documents from ${collection.name}`);
      } catch (error) {
        const errorMsg = `Failed to delete ${collection.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    // Clear any cached data or indexes
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (global as any).mongoose?.conn?.connection?.db;
      if (db) {
        // Drop all indexes to ensure clean state
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
          try {
            await db.collection(collection.name).dropIndexes();
          } catch (error) {
            // Ignore errors for dropping indexes
            console.log(`Could not drop indexes for ${collection.name}: ${error}`);
          }
        }
      }
    } catch (error) {
      console.log('Could not clear indexes:', error);
    }
    
    const totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);
    
    return {
      success: errors.length === 0,
      message: `Database reset completed. Deleted ${totalDeleted} documents across ${Object.keys(deletedCounts).length} collections.`,
      deletedCounts,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    const errorMsg = `Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    return {
      success: false,
      message: errorMsg,
      deletedCounts,
      errors: [errorMsg]
    };
  }
};

export const resetSpecificCollection = async (collectionName: string): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
  error?: string;
}> => {
  try {
    await connectDB();
    
    const collectionMap: Record<string, any> = {
      'users': User,
      'patients': Patient,
      'appointments': Appointment,
      'prescriptions': Prescription,
      'queues': Queue,
      'invoices': Invoice,
      'payments': Payment,
      'laborders': LabOrder,
      'deliveries': Delivery,
      'applicationsettings': ApplicationSettings,
      'auditlogs': require('./models/AuditLog').AuditLog
    };
    
    const Model = collectionMap[collectionName.toLowerCase()];
    if (!Model) {
      return {
        success: false,
        message: `Unknown collection: ${collectionName}`,
        deletedCount: 0,
        error: `Collection ${collectionName} not found`
      };
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (Model as any).deleteMany({});
    const deletedCount = result.deletedCount || 0;
    
    return {
      success: true,
      message: `Successfully deleted ${deletedCount} documents from ${collectionName}`,
      deletedCount
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to reset ${collectionName}`,
      deletedCount: 0,
      error: errorMsg
    };
  }
};

export const getDatabaseStats = async (): Promise<{
  success: boolean;
  stats: Record<string, number>;
  error?: string;
}> => {
  try {
    await connectDB();
    
    const collections = [
      { name: 'users', model: User },
      { name: 'patients', model: Patient },
      { name: 'appointments', model: Appointment },
      { name: 'prescriptions', model: Prescription },
      { name: 'queues', model: Queue },
      { name: 'invoices', model: Invoice },
      { name: 'payments', model: Payment },
      { name: 'laborders', model: LabOrder },
      { name: 'deliveries', model: Delivery },
      { name: 'applicationsettings', model: ApplicationSettings }
    ];
    
    const stats: Record<string, number> = {};
    
    for (const collection of collections) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (collection.model as any).countDocuments();
        stats[collection.name] = count;
      } catch (error) {
        console.error(`Failed to get count for ${collection.name}:`, error);
        stats[collection.name] = -1; // Indicate error
      }
    }
    
    return {
      success: true,
      stats
    };
    
  } catch (error) {
    return {
      success: false,
      stats: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

