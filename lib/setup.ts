import connectDB from './mongodb';
import { 
  createUser, 
  createPatient, 
  createAppointment, 
  createPrescription, 
  createLabOrder, 
  createInvoice, 
  createPayment, 
  addToQueue,
  createDelivery,
  initializeApplicationSettings,
  getUserByEmail,
  resetDatabase,
  getDatabaseStats
} from './database';
import { seedData } from './seedData';
// import { hashPassword } from './auth';

export interface SetupResult {
  success: boolean;
  message: string;
  data?: {
    adminUserId?: string;
    settingsId?: string;
    createdUsers?: number;
    createdPatients?: number;
    createdAppointments?: number;
    createdPrescriptions?: number;
    createdLabOrders?: number;
    createdInvoices?: number;
    createdPayments?: number;
    createdQueueEntries?: number;
    createdDeliveries?: number;
    resetResults?: Record<string, any>;
    resetStats?: Record<string, number>;
    successCount?: number;
    totalCount?: number;
  };
  errors?: string[];
}

/**
 * Complete application setup including admin user, settings, and seed data
 */
export async function setupApplication(options: {
  adminEmail?: string;
  adminPassword?: string;
  adminName?: string;
  includeSeedData?: boolean;
  resetExisting?: boolean;
  clinicSettings?: {
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
  };
} = {}): Promise<SetupResult> {
  const errors: string[] = [];
  const result: SetupResult = {
    success: false,
    message: '',
    data: {}
  };

  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database for setup...');

    // Reset database if resetExisting is true
    if (options.resetExisting) {
      console.log('Resetting database before setup...');
      const resetResult = await resetDatabase();
      if (!resetResult.success) {
        return {
          success: false,
          message: 'Database reset failed before setup',
          errors: resetResult.errors || ['Unknown error during reset']
        };
      }
      console.log('Database reset completed:', resetResult.message);
    }

    // Check if admin user already exists
    const existingAdmin = await getUserByEmail(options.adminEmail || seedData.adminUser.email);
    if (existingAdmin && !options.resetExisting) {
      return {
        success: false,
        message: 'Admin user already exists. Use resetExisting: true to reset the application.',
        errors: ['Admin user already exists']
      };
    }

    // Create admin user
    const adminUserData = {
      name: options.adminName || seedData.adminUser.name,
      email: options.adminEmail || seedData.adminUser.email,
      password: options.adminPassword || seedData.adminUser.password,
      role: 'admin' as const,
      department: seedData.adminUser.department,
      position: seedData.adminUser.position,
      employeeId: seedData.adminUser.employeeId
    };

    const adminUserId = await createUser(adminUserData);
    result.data!.adminUserId = adminUserId;
    console.log('Admin user created:', adminUserId);

    // Initialize application settings with custom clinic settings if provided
    const settings = await initializeApplicationSettings(adminUserId, options.clinicSettings);
    result.data!.settingsId = settings._id.toString();
    console.log('Application settings initialized');

    if (options.includeSeedData !== false) {
      // Create seed data
      const seedResult = await createSeedData(adminUserId);
      result.data = { ...result.data, ...seedResult };
    }

    result.success = true;
    result.message = 'Application setup completed successfully!';
    
    console.log('Setup completed successfully');
    return result;

  } catch (error) {
    console.error('Setup failed:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
    
    result.success = false;
    result.message = 'Setup failed';
    result.errors = errors;
    return result;
  }
}

/**
 * Create seed data for the application
 */
async function createSeedData(adminUserId: string) {
  const createdData: Record<string, number> = {
    createdUsers: 0,
    createdPatients: 0,
    createdAppointments: 0,
    createdPrescriptions: 0,
    createdLabOrders: 0,
    createdInvoices: 0,
    createdPayments: 0,
    createdQueueEntries: 0,
    createdDeliveries: 0
  };

  try {
    // Create doctors
    const doctorIds: string[] = [];
    for (const doctor of seedData.doctors) {
      try {
        const doctorId = await createUser(doctor);
        doctorIds.push(doctorId);
        createdData.createdUsers++;
      } catch (error) {
        console.error('Failed to create doctor:', doctor.name, error);
      }
    }

    // Create receptionists
    for (const receptionist of seedData.receptionists) {
      try {
        await createUser(receptionist);
        createdData.createdUsers++;
      } catch (error) {
        console.error('Failed to create receptionist:', receptionist.name, error);
      }
    }

    // Create medical representatives
    const medRepIds: string[] = [];
    for (const medrep of seedData.medreps) {
      try {
        const medRepId = await createUser(medrep);
        medRepIds.push(medRepId);
        createdData.createdUsers++;
      } catch (error) {
        console.error('Failed to create medrep:', medrep.name, error);
      }
    }

    // Create patients
    const patientIds: string[] = [];
    for (const patient of seedData.patients) {
      try {
        const patientId = await createPatient(patient);
        patientIds.push(patientId);
        createdData.createdPatients++;
      } catch (error) {
        console.error('Failed to create patient:', patient.firstName, patient.lastName, error);
      }
    }

    // Create appointments
    const appointmentIds: string[] = [];
    const sampleAppointments = seedData.getSampleAppointments(doctorIds, patientIds);
    for (const appointment of sampleAppointments) {
      try {
        const appointmentId = await createAppointment(appointment);
        appointmentIds.push(appointmentId);
        createdData.createdAppointments++;
      } catch (error) {
        console.error('Failed to create appointment:', appointment.appointmentId, error);
      }
    }

    // Create prescriptions
    const prescriptionIds: string[] = [];
    const samplePrescriptions = seedData.getSamplePrescriptions(doctorIds, patientIds, appointmentIds);
    for (const prescription of samplePrescriptions) {
      try {
        const prescriptionId = await createPrescription(prescription);
        prescriptionIds.push(prescriptionId);
        createdData.createdPrescriptions++;
      } catch (error) {
        console.error('Failed to create prescription:', prescription.prescriptionId, error);
      }
    }

    // Create lab orders
    const labOrderIds: string[] = [];
    const sampleLabOrders = seedData.getSampleLabOrders(doctorIds, patientIds, appointmentIds);
    for (const labOrder of sampleLabOrders) {
      try {
        const labOrderId = await createLabOrder(labOrder);
        labOrderIds.push(labOrderId);
        createdData.createdLabOrders++;
      } catch (error) {
        console.error('Failed to create lab order:', labOrder.labOrderId, error);
      }
    }

    // Create invoices
    const invoiceIds: string[] = [];
    const sampleInvoices = seedData.getSampleInvoices(patientIds, appointmentIds);
    for (const invoice of sampleInvoices) {
      try {
        const invoiceId = await createInvoice(invoice);
        invoiceIds.push(invoiceId);
        createdData.createdInvoices++;
      } catch (error) {
        console.error('Failed to create invoice:', invoice.invoiceId, error);
      }
    }

    // Create payments
    const samplePayments = seedData.getSamplePayments(patientIds, invoiceIds, [adminUserId]);
    for (const payment of samplePayments) {
      try {
        await createPayment(payment);
        createdData.createdPayments++;
      } catch (error) {
        console.error('Failed to create payment:', payment.paymentId, error);
      }
    }

    // Create queue entries
    const sampleQueueEntries = seedData.getSampleQueueEntries(patientIds, appointmentIds, doctorIds);
    for (const queueEntry of sampleQueueEntries) {
      try {
        await addToQueue(queueEntry);
        createdData.createdQueueEntries++;
      } catch (error) {
        console.error('Failed to create queue entry:', queueEntry.queueId, error);
      }
    }

    // Create deliveries
    // Note: prescriptionIds are MongoDB _id strings, but Delivery model expects prescriptionId as string
    // We'll use the MongoDB _id as the prescriptionId for deliveries
    const sampleDeliveries = seedData.getSampleDeliveries(
      prescriptionIds, // These are MongoDB _id strings
      patientIds, // These are MongoDB _id strings
      seedData.patients, // Patient data for names and addresses
      medRepIds // MedRep MongoDB _id strings
    );
    for (const delivery of sampleDeliveries) {
      try {
        await createDelivery(delivery);
        createdData.createdDeliveries++;
      } catch (error) {
        console.error('Failed to create delivery:', delivery.prescriptionId, error);
      }
    }

    console.log('Seed data creation completed:', createdData);
    return createdData;

  } catch (error) {
    console.error('Error creating seed data:', error);
    throw error;
  }
}

/**
 * Reset the application (remove all data and recreate)
 */
export async function resetApplication(): Promise<SetupResult> {
  try {
    await connectDB();
    
    console.log('Starting application reset...');
    
    // First, get current database stats for logging
    const statsBefore = await getDatabaseStats();
    console.log('Database stats before reset:', statsBefore.stats);
    
    // Perform complete database reset
    const resetResult = await resetDatabase();
    
    if (!resetResult.success) {
      return {
        success: false,
        message: 'Database reset failed',
        errors: resetResult.errors || ['Unknown error during reset']
      };
    }
    
    console.log('Database reset completed:', resetResult.message);
    console.log('Deleted counts:', resetResult.deletedCounts);
    
    // Now recreate the application with default settings
    const setupResult = await setupApplication({ 
      includeSeedData: true, 
      resetExisting: true 
    });
    
    if (setupResult.success) {
      return {
        success: true,
        message: `Application reset completed successfully. ${resetResult.message} Application has been recreated with fresh data.`,
        data: {
          ...setupResult.data,
          resetStats: resetResult.deletedCounts
        }
      };
    } else {
      return {
        success: false,
        message: `Database was reset but application recreation failed: ${setupResult.message}`,
        errors: setupResult.errors
      };
    }
    
  } catch (error) {
    console.error('Reset failed:', error);
    return {
      success: false,
      message: 'Application reset failed',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

/**
 * Check if the application is already set up
 */
export async function isApplicationSetup(): Promise<boolean> {
  try {
    await connectDB();
    const adminUser = await getUserByEmail(seedData.adminUser.email);
    return !!adminUser;
  } catch (error) {
    console.error('Error checking setup status:', error);
    return false;
  }
}

/**
 * Get setup status information
 */
export async function getSetupStatus(): Promise<{
  isSetup: boolean;
  hasAdmin: boolean;
  hasSettings: boolean;
  userCount: number;
  databaseStats: Record<string, number>;
}> {
  try {
    await connectDB();
    
    const adminUser = await getUserByEmail(seedData.adminUser.email);
    const hasAdmin = !!adminUser;
    
    // Get database statistics
    const statsResult = await getDatabaseStats();
    const databaseStats = statsResult.success ? statsResult.stats : {};
    
    return {
      isSetup: hasAdmin,
      hasAdmin,
      hasSettings: false, // You would check for settings here
      userCount: databaseStats.users || 0,
      databaseStats
    };
    
  } catch (error) {
    console.error('Error getting setup status:', error);
    return {
      isSetup: false,
      hasAdmin: false,
      hasSettings: false,
      userCount: 0,
      databaseStats: {}
    };
  }
}

/**
 * Reset specific collections only
 */
export async function resetSpecificCollections(collections: string[]): Promise<SetupResult> {
  try {
    await connectDB();
    
    console.log('Starting selective reset for collections:', collections);
    
    const results: Record<string, any> = {};
    const errors: string[] = [];
    
    for (const collection of collections) {
      try {
        const { resetSpecificCollection } = await import('./database');
        const result = await resetSpecificCollection(collection);
        results[collection] = result;
        
        if (!result.success) {
          errors.push(`Failed to reset ${collection}: ${result.error}`);
        }
      } catch (error) {
        const errorMsg = `Error resetting ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        results[collection] = { success: false, error: errorMsg };
      }
    }
    
    const successCount = Object.values(results).filter((r: any) => r.success).length;
    const totalCount = collections.length;
    
    return {
      success: errors.length === 0,
      message: `Selective reset completed. Successfully reset ${successCount}/${totalCount} collections.`,
      data: {
        resetResults: results,
        successCount,
        totalCount
      },
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    console.error('Selective reset failed:', error);
    return {
      success: false,
      message: 'Selective reset failed',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}
