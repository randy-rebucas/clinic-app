import connectDB from './mongodb';
import { User } from './models/User';
import { Patient } from './models/Patient';
import { Appointment } from './models/Appointment';
import { Prescription } from './models/Prescription';
import { Queue } from './models/Queue';
import { Invoice, Payment } from './models/Billing';
import { LabOrder } from './models/Lab';
import { AuditLog } from './models/AuditLog';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
// import { Document } from 'mongoose';

// Generic interface for Mongoose models with find method
interface MongooseModel {
  find(filter?: Record<string, unknown>): {
    lean(): Promise<Record<string, unknown>[]>;
  };
}

export interface BackupData {
  backupId: string;
  timestamp: Date;
  version: string;
  collections: {
    users: Record<string, unknown>[];
    patients: Record<string, unknown>[];
    appointments: Record<string, unknown>[];
    prescriptions: Record<string, unknown>[];
    queue: Record<string, unknown>[];
    invoices: Record<string, unknown>[];
    payments: Record<string, unknown>[];
    labOrders: Record<string, unknown>[];
    auditLogs: Record<string, unknown>[];
  };
  metadata: {
    totalRecords: number;
    backupSize: number;
    createdBy: string;
    description?: string;
  };
}

export interface BackupOptions {
  includeAuditLogs?: boolean;
  includeDeletedRecords?: boolean;
  collections?: string[];
  createdBy: string;
  description?: string;
}

export class BackupService {
  private static instance: BackupService;
  private backupDir: string;

  private constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  public async createBackup(options: BackupOptions): Promise<BackupData> {
    try {
      await connectDB();
      
      const backupId = uuidv4();
      const timestamp = new Date();
      const collections = options.collections || [
        'users', 'patients', 'appointments', 'prescriptions', 
        'queue', 'invoices', 'payments', 'labOrders'
      ];

      if (options.includeAuditLogs) {
        collections.push('auditLogs');
      }

      const backupData: BackupData = {
        backupId,
        timestamp,
        version: '1.0.0',
        collections: {
          users: [],
          patients: [],
          appointments: [],
          prescriptions: [],
          queue: [],
          invoices: [],
          payments: [],
          labOrders: [],
          auditLogs: [],
        },
        metadata: {
          totalRecords: 0,
          backupSize: 0,
          createdBy: options.createdBy,
          description: options.description,
        },
      };

      // Backup each collection
      for (const collection of collections) {
        switch (collection) {
          case 'users':
            backupData.collections.users = await (User as MongooseModel).find({}).lean();
            break;
          case 'patients':
            backupData.collections.patients = await (Patient as MongooseModel).find({}).lean();
            break;
          case 'appointments':
            backupData.collections.appointments = await (Appointment as MongooseModel).find({}).lean();
            break;
          case 'prescriptions':
            backupData.collections.prescriptions = await (Prescription as MongooseModel).find({}).lean();
            break;
          case 'queue':
            backupData.collections.queue = await (Queue as MongooseModel).find({}).lean();
            break;
          case 'invoices':
            backupData.collections.invoices = await (Invoice as MongooseModel).find({}).lean();
            break;
          case 'payments':
            backupData.collections.payments = await (Payment as MongooseModel).find({}).lean();
            break;
          case 'labOrders':
            backupData.collections.labOrders = await (LabOrder as MongooseModel).find({}).lean();
            break;
          case 'auditLogs':
            backupData.collections.auditLogs = await (AuditLog as MongooseModel).find({}).lean();
            break;
        }
      }

      // Calculate metadata
      backupData.metadata.totalRecords = Object.values(backupData.collections)
        .reduce((total, collection) => total + collection.length, 0);
      
      const backupJson = JSON.stringify(backupData, null, 2);
      backupData.metadata.backupSize = Buffer.byteLength(backupJson, 'utf8');

      // Save backup to file
      const filename = `backup_${backupId}_${timestamp.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.backupDir, filename);
      await fs.writeFile(filepath, backupJson, 'utf8');

      // Log backup creation
      console.log(`Backup created: ${filename} (${backupData.metadata.totalRecords} records)`);

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  public async restoreBackup(backupId: string, options: {
    collections?: string[];
    createdBy: string;
    skipExisting?: boolean;
  }): Promise<void> {
    try {
      await connectDB();
      
      // Find backup file
      const files = await fs.readdir(this.backupDir);
      const backupFile = files.find(file => file.includes(backupId));
      
      if (!backupFile) {
        throw new Error('Backup file not found');
      }

      const filepath = path.join(this.backupDir, backupFile);
      const backupJson = await fs.readFile(filepath, 'utf8');
      const backupData: BackupData = JSON.parse(backupJson);

      // Validate backup data
      this.validateBackupData(backupData);

      const collections = options.collections || Object.keys(backupData.collections);

      // Restore each collection
      for (const collection of collections) {
        const data = backupData.collections[collection as keyof typeof backupData.collections];
        if (!data || data.length === 0) continue;

        switch (collection) {
          case 'users':
            await this.restoreCollection(User, data, options.skipExisting);
            break;
          case 'patients':
            await this.restoreCollection(Patient, data, options.skipExisting);
            break;
          case 'appointments':
            await this.restoreCollection(Appointment, data, options.skipExisting);
            break;
          case 'prescriptions':
            await this.restoreCollection(Prescription, data, options.skipExisting);
            break;
          case 'queue':
            await this.restoreCollection(Queue, data, options.skipExisting);
            break;
          case 'invoices':
            await this.restoreCollection(Invoice, data, options.skipExisting);
            break;
          case 'payments':
            await this.restoreCollection(Payment, data, options.skipExisting);
            break;
          case 'labOrders':
            await this.restoreCollection(LabOrder, data, options.skipExisting);
            break;
          case 'auditLogs':
            await this.restoreCollection(AuditLog, data, options.skipExisting);
            break;
        }
      }

      console.log(`Backup restored successfully: ${backupId}`);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Failed to restore backup');
    }
  }

  private async restoreCollection(Model: { findById: (id: string) => Promise<unknown>; create: (data: Record<string, unknown>) => Promise<unknown> }, data: Record<string, unknown>[], skipExisting: boolean = false): Promise<void> {
    for (const item of data) {
      try {
        if (skipExisting) {
          const existing = await Model.findById(item._id as string);
          if (existing) {
            console.log(`Skipping existing record: ${item._id as string}`);
            continue;
          }
        }

        // Remove _id to let MongoDB generate new one if needed
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...itemData } = item;
        await Model.create(itemData);
      } catch (error) {
        console.error(`Error restoring record ${item._id as string}:`, error);
        // Continue with other records
      }
    }
  }

  private validateBackupData(data: BackupData): void {
    const backupSchema = z.object({
      backupId: z.string(),
      timestamp: z.date(),
      version: z.string(),
      collections: z.object({
        users: z.array(z.record(z.unknown())),
        patients: z.array(z.record(z.unknown())),
        appointments: z.array(z.record(z.unknown())),
        prescriptions: z.array(z.record(z.unknown())),
        queue: z.array(z.record(z.unknown())),
        invoices: z.array(z.record(z.unknown())),
        payments: z.array(z.record(z.unknown())),
        labOrders: z.array(z.record(z.unknown())),
        auditLogs: z.array(z.record(z.unknown())),
      }),
      metadata: z.object({
        totalRecords: z.number(),
        backupSize: z.number(),
        createdBy: z.string(),
        description: z.string().optional(),
      }),
    });

    try {
      backupSchema.parse(data);
    } catch (error) {
      console.error('Backup validation error:', error);
      throw new Error('Invalid backup data format');
    }
  }

  public async listBackups(): Promise<Array<{
    filename: string;
    backupId: string;
    timestamp: Date;
    size: number;
    records: number;
  }>> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);
          const content = await fs.readFile(filepath, 'utf8');
          const data = JSON.parse(content);

          backups.push({
            filename: file,
            backupId: data.backupId,
            timestamp: new Date(data.timestamp),
            size: stats.size,
            records: data.metadata.totalRecords,
          });
        } catch (error) {
          console.error(`Error reading backup file ${file}:`, error);
        }
      }

      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  public async deleteBackup(backupId: string): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFile = files.find(file => file.includes(backupId));
      
      if (!backupFile) {
        throw new Error('Backup file not found');
      }

      const filepath = path.join(this.backupDir, backupFile);
      await fs.unlink(filepath);
      
      console.log(`Backup deleted: ${backupFile}`);
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw new Error('Failed to delete backup');
    }
  }

  public async scheduleBackup(options: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    createdBy: string;
    description?: string;
  }): Promise<void> {
    // This would integrate with a job scheduler like node-cron
    // For now, we'll just log the schedule
    console.log(`Backup scheduled: ${options.frequency} at ${options.time}`);
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();
