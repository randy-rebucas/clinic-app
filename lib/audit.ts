import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from './models/AuditLog';
import connectDB from './mongodb';

export interface AuditLogData {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'patient' | 'appointment' | 'prescription' | 'billing' | 'lab' | 'queue' | 'system' | 'security';
  success?: boolean;
  errorMessage?: string;
  sessionId?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public async log(data: AuditLogData): Promise<void> {
    try {
      await connectDB();
      
      const logId = uuidv4();
      const auditLog = new AuditLog({
        logId,
        userId: data.userId,
        userRole: data.userRole,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
        severity: data.severity || 'low',
        category: data.category,
        success: data.success !== false,
        errorMessage: data.errorMessage,
        sessionId: data.sessionId,
      });

      await auditLog.save();
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main application flow
    }
  }

  // Convenience methods for common audit events
  public async logAuthentication(
    userId: string,
    userRole: string,
    action: 'login' | 'logout' | 'login_failed' | 'password_change' | 'account_locked',
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'authentication',
      category: 'authentication',
      success,
      ipAddress,
      userAgent,
      errorMessage,
      severity: action === 'login_failed' || action === 'account_locked' ? 'high' : 'low',
    });
  }

  public async logPatientAction(
    userId: string,
    userRole: string,
    action: 'create' | 'update' | 'delete' | 'view' | 'search',
    patientId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'patient',
      resourceId: patientId,
      details,
      category: 'patient',
      ipAddress,
      userAgent,
      severity: action === 'delete' ? 'high' : 'low',
    });
  }

  public async logAppointmentAction(
    userId: string,
    userRole: string,
    action: 'create' | 'update' | 'cancel' | 'reschedule' | 'complete',
    appointmentId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'appointment',
      resourceId: appointmentId,
      details,
      category: 'appointment',
      ipAddress,
      userAgent,
      severity: action === 'cancel' ? 'medium' : 'low',
    });
  }

  public async logPrescriptionAction(
    userId: string,
    userRole: string,
    action: 'create' | 'update' | 'approve' | 'dispense' | 'deliver',
    prescriptionId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'prescription',
      resourceId: prescriptionId,
      details,
      category: 'prescription',
      ipAddress,
      userAgent,
      severity: action === 'dispense' || action === 'deliver' ? 'medium' : 'low',
    });
  }

  public async logBillingAction(
    userId: string,
    userRole: string,
    action: 'create_invoice' | 'process_payment' | 'refund' | 'void',
    resourceId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'billing',
      resourceId,
      details,
      category: 'billing',
      ipAddress,
      userAgent,
      severity: action === 'refund' || action === 'void' ? 'high' : 'low',
    });
  }

  public async logLabAction(
    userId: string,
    userRole: string,
    action: 'create_order' | 'update_results' | 'approve_results' | 'critical_alert',
    labOrderId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'lab_order',
      resourceId: labOrderId,
      details,
      category: 'lab',
      ipAddress,
      userAgent,
      severity: action === 'critical_alert' ? 'critical' : 'low',
    });
  }

  public async logQueueAction(
    userId: string,
    userRole: string,
    action: 'add_patient' | 'call_patient' | 'start_consultation' | 'complete_consultation',
    patientId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'queue',
      resourceId: patientId,
      details,
      category: 'queue',
      ipAddress,
      userAgent,
      severity: 'low',
    });
  }

  public async logSystemAction(
    userId: string,
    userRole: string,
    action: 'backup' | 'restore' | 'maintenance' | 'config_change',
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'system',
      details,
      category: 'system',
      ipAddress,
      userAgent,
      severity: action === 'config_change' ? 'high' : 'medium',
    });
  }

  public async logSecurityEvent(
    userId: string,
    userRole: string,
    action: 'unauthorized_access' | 'data_breach' | 'suspicious_activity' | 'permission_escalation',
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource: 'security',
      details,
      category: 'security',
      ipAddress,
      userAgent,
      severity: 'critical',
      success: false,
    });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Helper function to get client IP from request
export function getClientIP(req: { headers: Headers | Record<string, string | string[] | undefined>; connection?: { remoteAddress?: string }; socket?: { remoteAddress?: string }; ip?: string }): string {
  const headers = req.headers instanceof Headers ? Object.fromEntries(req.headers.entries()) : req.headers;
  const xForwardedFor = headers['x-forwarded-for'];
  const xRealIp = headers['x-real-ip'];
  
  return (
    (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0] : xForwardedFor?.[0]) ||
    (typeof xRealIp === 'string' ? xRealIp : xRealIp?.[0]) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// Helper function to get user agent from request
export function getUserAgent(req: { headers: Headers | Record<string, string | string[] | undefined> }): string {
  const headers = req.headers instanceof Headers ? Object.fromEntries(req.headers.entries()) : req.headers;
  const userAgent = headers['user-agent'];
  return (typeof userAgent === 'string' ? userAgent : userAgent?.[0]) || 'unknown';
}
