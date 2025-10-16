/**
 * Attendance Tracking Service
 * Tracks daily attendance, working hours, and punch-in/punch-out records
 */

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date; // YYYY-MM-DD format
  punchInTime?: Date;
  punchOutTime?: Date;
  totalWorkingHours: number; // in hours
  totalBreakTime: number; // in hours
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PunchRecord {
  id: string;
  employeeId: string;
  attendanceRecordId: string;
  punchType: 'in' | 'out';
  punchTime: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
    ipAddress?: string;
  };
  isManual: boolean; // true if manually entered, false if automatic
  notes?: string;
  createdAt: Date;
}

export interface AttendanceSettings {
  id: string;
  employeeId: string;
  workStartTime: string; // HH:MM format
  workEndTime: string; // HH:MM format
  breakDuration: number; // in minutes
  lateThreshold: number; // minutes after start time to be considered late
  earlyLeaveThreshold: number; // minutes before end time to be considered early leave
  overtimeThreshold: number; // hours after scheduled end to be considered overtime
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
  requireLocation: boolean;
  allowRemoteWork: boolean;
  autoPunchOut: boolean; // automatically punch out at end of day
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSummary {
  employeeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  averageWorkingHours: number;
  punctualityScore: number; // 0-100
  attendanceRate: number; // 0-100
}

class AttendanceTrackingService {
  private static instance: AttendanceTrackingService;
  private attendanceSettings: Map<string, AttendanceSettings> = new Map();
  private currentAttendance: Map<string, AttendanceRecord> = new Map();

  private constructor() {}

  static getInstance(): AttendanceTrackingService {
    if (!AttendanceTrackingService.instance) {
      AttendanceTrackingService.instance = new AttendanceTrackingService();
    }
    return AttendanceTrackingService.instance;
  }

  /**
   * Initialize attendance tracking for an employee
   */
  async initialize(employeeId: string): Promise<void> {
    try {
      // Load attendance settings
      const settings = await this.getAttendanceSettings(employeeId);
      if (settings) {
        this.attendanceSettings.set(employeeId, settings);
      }

      // Load today's attendance record
      const todayRecord = await this.getTodayAttendanceRecord(employeeId);
      if (todayRecord) {
        this.currentAttendance.set(employeeId, todayRecord);
      }

      console.log(`Attendance tracking initialized for employee ${employeeId}`);
    } catch (error) {
      console.error('Failed to initialize attendance tracking:', error);
    }
  }

  /**
   * Punch in for an employee
   */
  async punchIn(employeeId: string, options?: {
    location?: { latitude: number; longitude: number; address?: string };
    notes?: string;
    isManual?: boolean;
  }): Promise<{ attendanceRecordId: string; punchRecordId: string; isLate: boolean }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get or create today's attendance record
      let attendanceRecord = await this.getTodayAttendanceRecord(employeeId);
      if (!attendanceRecord) {
        attendanceRecord = await this.createAttendanceRecord(employeeId, today);
      }

      // Check if already punched in
      if (attendanceRecord.punchInTime) {
        throw new Error('Already punched in today');
      }

      // Get attendance settings
      const settings = this.attendanceSettings.get(employeeId);
      if (!settings) {
        throw new Error('Attendance settings not found');
      }

      // Check if it's a working day
      if (!this.isWorkingDay(today, settings)) {
        throw new Error('Today is not a working day');
      }

      // Calculate if late
      const workStartTime = this.parseTime(settings.workStartTime);
      const scheduledStart = new Date(today);
      scheduledStart.setHours(workStartTime.hours, workStartTime.minutes, 0, 0);
      
      const isLate = now > new Date(scheduledStart.getTime() + settings.lateThreshold * 60000);
      const lateMinutes = isLate ? Math.floor((now.getTime() - scheduledStart.getTime()) / 60000) : 0;

      // Create punch record
      const punchRecord = await this.createPunchRecord({
        employeeId,
        attendanceRecordId: attendanceRecord.id,
        punchType: 'in',
        punchTime: now,
        location: options?.location,
        deviceInfo: this.getDeviceInfo(),
        isManual: options?.isManual || false,
        notes: options?.notes,
      });

      // Update attendance record
      const updatedAttendance = await this.updateAttendanceRecord(attendanceRecord.id, {
        punchInTime: now,
        status: isLate ? 'late' : 'present',
        lateMinutes: isLate ? lateMinutes : undefined,
        updatedAt: now,
      });

      // Update local cache
      this.currentAttendance.set(employeeId, updatedAttendance);

      console.log(`Punch in recorded for employee ${employeeId} at ${now.toLocaleTimeString()}`);
      
      return {
        attendanceRecordId: attendanceRecord.id,
        punchRecordId: punchRecord.id,
        isLate,
      };
    } catch (error) {
      console.error('Failed to punch in:', error);
      throw error;
    }
  }

  /**
   * Punch out for an employee
   */
  async punchOut(employeeId: string, options?: {
    location?: { latitude: number; longitude: number; address?: string };
    notes?: string;
    isManual?: boolean;
  }): Promise<{ attendanceRecordId: string; punchRecordId: string; totalHours: number }> {
    try {
      const now = new Date();
      
      // Get today's attendance record
      const attendanceRecord = this.currentAttendance.get(employeeId);
      if (!attendanceRecord || !attendanceRecord.punchInTime) {
        throw new Error('No punch in record found for today');
      }

      // Check if already punched out
      if (attendanceRecord.punchOutTime) {
        throw new Error('Already punched out today');
      }

      // Get attendance settings
      const settings = this.attendanceSettings.get(employeeId);
      if (!settings) {
        throw new Error('Attendance settings not found');
      }

      // Calculate working hours
      const workingHours = (now.getTime() - attendanceRecord.punchInTime.getTime()) / (1000 * 60 * 60);
      const breakTime = attendanceRecord.totalBreakTime || 0;
      const netWorkingHours = Math.max(0, workingHours - breakTime);

      // Check for early leave
      const workEndTime = this.parseTime(settings.workEndTime);
      const scheduledEnd = new Date(attendanceRecord.punchInTime);
      scheduledEnd.setHours(workEndTime.hours, workEndTime.minutes, 0, 0);
      
      const isEarlyLeave = now < new Date(scheduledEnd.getTime() - settings.earlyLeaveThreshold * 60000);
      const earlyLeaveMinutes = isEarlyLeave ? Math.floor((scheduledEnd.getTime() - now.getTime()) / 60000) : 0;

      // Check for overtime
      const overtimeHours = now > scheduledEnd ? 
        Math.floor((now.getTime() - scheduledEnd.getTime()) / (1000 * 60 * 60) * 100) / 100 : 0;

      // Create punch record
      const punchRecord = await this.createPunchRecord({
        employeeId,
        attendanceRecordId: attendanceRecord.id,
        punchType: 'out',
        punchTime: now,
        location: options?.location,
        deviceInfo: this.getDeviceInfo(),
        isManual: options?.isManual || false,
        notes: options?.notes,
      });

      // Update attendance record
      const updatedAttendance = await this.updateAttendanceRecord(attendanceRecord.id, {
        punchOutTime: now,
        totalWorkingHours: netWorkingHours,
        earlyLeaveMinutes: isEarlyLeave ? earlyLeaveMinutes : undefined,
        overtimeHours: overtimeHours > 0 ? overtimeHours : undefined,
        status: this.calculateAttendanceStatus(attendanceRecord, isEarlyLeave, overtimeHours),
        updatedAt: now,
      });

      // Update local cache
      this.currentAttendance.set(employeeId, updatedAttendance);

      console.log(`Punch out recorded for employee ${employeeId} at ${now.toLocaleTimeString()}`);
      
      return {
        attendanceRecordId: attendanceRecord.id,
        punchRecordId: punchRecord.id,
        totalHours: netWorkingHours,
      };
    } catch (error) {
      console.error('Failed to punch out:', error);
      throw error;
    }
  }

  /**
   * Get today's attendance record
   */
  async getTodayAttendanceRecord(employeeId: string): Promise<AttendanceRecord | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check local cache first
      const cached = this.currentAttendance.get(employeeId);
      if (cached && this.isSameDay(cached.date, today)) {
        return cached;
      }

      // Load from database
      const { getAttendanceRecord } = await import('./database');
      return await getAttendanceRecord(employeeId, today);
    } catch (error) {
      console.error('Failed to get today\'s attendance record:', error);
      return null;
    }
  }

  /**
   * Get attendance summary for a period
   */
  async getAttendanceSummary(employeeId: string, startDate: Date, endDate: Date): Promise<AttendanceSummary> {
    try {
      const { getAttendanceRecords } = await import('./database');
      const records = await getAttendanceRecords(employeeId, startDate, endDate);
      
      const workingDays = this.calculateWorkingDays(startDate, endDate, employeeId);
      const presentDays = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;
      const halfDays = records.filter(r => r.status === 'half_day').length;
      
      const totalWorkingHours = records.reduce((sum, r) => sum + r.totalWorkingHours, 0);
      const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      const averageWorkingHours = records.length > 0 ? totalWorkingHours / records.length : 0;
      
      const punctualityScore = this.calculatePunctualityScore(records);
      const attendanceRate = workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

      return {
        employeeId,
        period: { startDate, endDate },
        totalWorkingDays: workingDays,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        totalWorkingHours,
        totalOvertimeHours,
        averageWorkingHours,
        punctualityScore,
        attendanceRate,
      };
    } catch (error) {
      console.error('Failed to get attendance summary:', error);
      throw error;
    }
  }

  /**
   * Get attendance settings for an employee
   */
  private async getAttendanceSettings(employeeId: string): Promise<AttendanceSettings | null> {
    try {
      const { getAttendanceSettings } = await import('./database');
      return await getAttendanceSettings(employeeId);
    } catch (error) {
      console.error('Failed to get attendance settings:', error);
      return null;
    }
  }

  /**
   * Create a new attendance record
   */
  private async createAttendanceRecord(employeeId: string, date: Date): Promise<AttendanceRecord> {
    try {
      const { createAttendanceRecord } = await import('./database');
      return await createAttendanceRecord({
        employeeId,
        date,
        totalWorkingHours: 0,
        totalBreakTime: 0,
        status: 'absent',
      });
    } catch (error) {
      console.error('Failed to create attendance record:', error);
      throw error;
    }
  }

  /**
   * Update an attendance record
   */
  private async updateAttendanceRecord(recordId: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    try {
      const { updateAttendanceRecord } = await import('./database');
      return await updateAttendanceRecord(recordId, updates);
    } catch (error) {
      console.error('Failed to update attendance record:', error);
      throw error;
    }
  }

  /**
   * Create a punch record
   */
  private async createPunchRecord(data: Omit<PunchRecord, 'id' | 'createdAt'>): Promise<PunchRecord> {
    try {
      const { createPunchRecord } = await import('./database');
      return await createPunchRecord(data);
    } catch (error) {
      console.error('Failed to create punch record:', error);
      throw error;
    }
  }

  /**
   * Parse time string (HH:MM) to hours and minutes
   */
  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Check if a date is a working day
   */
  private isWorkingDay(date: Date, settings: AttendanceSettings): boolean {
    const dayOfWeek = date.getDay();
    return settings.workingDays.includes(dayOfWeek);
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Calculate working days in a period
   */
  private calculateWorkingDays(startDate: Date, endDate: Date, employeeId: string): number {
    const settings = this.attendanceSettings.get(employeeId);
    if (!settings) return 0;

    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (this.isWorkingDay(current, settings)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Calculate punctuality score (0-100)
   */
  private calculatePunctualityScore(records: AttendanceRecord[]): number {
    const presentRecords = records.filter(r => r.status === 'present' || r.status === 'late');
    if (presentRecords.length === 0) return 0;

    const onTimeRecords = presentRecords.filter(r => r.status === 'present').length;
    return Math.round((onTimeRecords / presentRecords.length) * 100);
  }

  /**
   * Calculate attendance status
   */
  private calculateAttendanceStatus(record: AttendanceRecord, isEarlyLeave: boolean, overtimeHours: number): AttendanceRecord['status'] {
    if (record.status === 'absent') return 'absent';
    if (isEarlyLeave) return 'half_day';
    if (overtimeHours > 0) return 'present'; // Overtime is still considered present
    return record.status;
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): PunchRecord['deviceInfo'] {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };
  }

  /**
   * Get current attendance status for an employee
   */
  getCurrentAttendanceStatus(employeeId: string): {
    isPunchedIn: boolean;
    punchInTime?: Date;
    workingHours?: number;
    status?: AttendanceRecord['status'];
  } {
    const record = this.currentAttendance.get(employeeId);
    if (!record) {
      return { isPunchedIn: false };
    }

    const isPunchedIn = !!record.punchInTime && !record.punchOutTime;
    let workingHours: number | undefined;

    if (isPunchedIn && record.punchInTime) {
      workingHours = (Date.now() - record.punchInTime.getTime()) / (1000 * 60 * 60);
    } else if (record.punchOutTime && record.punchInTime) {
      workingHours = record.totalWorkingHours;
    }

    return {
      isPunchedIn,
      punchInTime: record.punchInTime,
      workingHours,
      status: record.status,
    };
  }

  /**
   * Update attendance settings
   */
  async updateAttendanceSettings(employeeId: string, updates: Partial<AttendanceSettings>): Promise<void> {
    try {
      const { updateAttendanceSettings } = await import('./database');
      await updateAttendanceSettings(employeeId, updates);
      
      // Update local cache
      const currentSettings = this.attendanceSettings.get(employeeId);
      if (currentSettings) {
        this.attendanceSettings.set(employeeId, { ...currentSettings, ...updates });
      }
    } catch (error) {
      console.error('Failed to update attendance settings:', error);
      throw error;
    }
  }
}

export const attendanceTrackingService = AttendanceTrackingService.getInstance();
