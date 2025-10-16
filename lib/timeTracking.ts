import { 
  createTimeEntry, 
  createWorkSession, 
  updateWorkSession, 
  getActiveWorkSession,
  createBreakSession,
  updateBreakSession,
  getActiveBreakSession,
  createDailySummary,
  updateDailySummary,
  getDailySummary
} from './database';
import { TimeEntry, WorkSession, BreakSession } from '@/types';
import { isDemoMode, createDemoTimeEntry, createDemoWorkSession } from './demoMode';

export interface ClockInData {
  employeeId: string;
  notes?: string;
  location?: string;
}

export interface ClockOutData {
  employeeId: string;
  notes?: string;
}

export interface BreakData {
  workSessionId: string;
  notes?: string;
}

export class TimeTrackingService {
  // Clock In/Out Operations
  static async clockIn(data: ClockInData): Promise<{ workSessionId: string; timeEntryId: string }> {
    const now = new Date();
    
    if (isDemoMode()) {
      // Demo mode - simulate clock in
      const timeEntryId = `demo-entry-${Date.now()}`;
      const workSessionId = `demo-session-${Date.now()}`;
      console.log('Demo: Clocked in at', now.toLocaleTimeString());
      return { workSessionId, timeEntryId };
    }
    
    // Check if employee already has an active work session
    const activeSession = await getActiveWorkSession(data.employeeId);
    if (activeSession) {
      throw new Error('Employee already has an active work session');
    }

    // Create time entry
    const timeEntryId = await createTimeEntry({
      employeeId: data.employeeId,
      type: 'clock_in',
      timestamp: now,
      notes: data.notes,
      location: data.location,
    });

    // Create work session
    const workSessionId = await createWorkSession({
      employeeId: data.employeeId,
      clockInTime: now,
      totalBreakTime: 0,
      totalWorkTime: 0,
      status: 'active',
    });

    return { workSessionId, timeEntryId };
  }

  static async clockOut(data: ClockOutData): Promise<{ workSessionId: string; timeEntryId: string }> {
    const now = new Date();
    
    if (isDemoMode()) {
      // Demo mode - simulate clock out
      const timeEntryId = `demo-entry-${Date.now()}`;
      const workSessionId = `demo-session-${Date.now()}`;
      console.log('Demo: Clocked out at', now.toLocaleTimeString());
      return { workSessionId, timeEntryId };
    }
    
    // Get active work session
    const activeSession = await getActiveWorkSession(data.employeeId);
    if (!activeSession) {
      throw new Error('No active work session found');
    }

    // Check if employee is currently on break
    const activeBreak = await getActiveBreakSession(activeSession.id);
    if (activeBreak) {
      throw new Error('Cannot clock out while on break. Please end your break first.');
    }

    // Create time entry
    const timeEntryId = await createTimeEntry({
      employeeId: data.employeeId,
      type: 'clock_out',
      timestamp: now,
      notes: data.notes,
    });

    // Calculate total work time
    const totalWorkTime = this.calculateWorkTime(activeSession.clockInTime, now, activeSession.totalBreakTime);

    // Update work session
    await updateWorkSession(activeSession.id, {
      clockOutTime: now,
      totalWorkTime,
      status: 'completed',
    });

    // Update daily summary
    await this.updateDailySummary(data.employeeId, now);

    return { workSessionId: activeSession.id, timeEntryId };
  }

  // Break Operations
  static async startBreak(data: BreakData): Promise<{ breakSessionId: string; timeEntryId: string }> {
    const now = new Date();
    
    // Check if there's already an active break
    const activeBreak = await getActiveBreakSession(data.workSessionId);
    if (activeBreak) {
      throw new Error('Employee is already on break');
    }

    // Create time entry
    const timeEntryId = await createTimeEntry({
      employeeId: '', // Will be filled from work session
      type: 'break_start',
      timestamp: now,
      notes: data.notes,
    });

    // Create break session
    const breakSessionId = await createBreakSession({
      workSessionId: data.workSessionId,
      startTime: now,
      status: 'active',
      notes: data.notes,
    });

    return { breakSessionId, timeEntryId };
  }

  static async endBreak(workSessionId: string, notes?: string): Promise<{ breakSessionId: string; timeEntryId: string }> {
    const now = new Date();
    
    // Get active break session
    const activeBreak = await getActiveBreakSession(workSessionId);
    if (!activeBreak) {
      throw new Error('No active break session found');
    }

    // Calculate break duration
    const duration = Math.floor((now.getTime() - activeBreak.startTime.getTime()) / (1000 * 60));

    // Create time entry
    const timeEntryId = await createTimeEntry({
      employeeId: '', // Will be filled from work session
      type: 'break_end',
      timestamp: now,
      notes,
    });

    // Update break session
    await updateBreakSession(activeBreak.id, {
      endTime: now,
      duration,
      status: 'completed',
    });

    // Update work session with new break time
    const workSession = await getActiveWorkSession(''); // We need to get the work session
    if (workSession) {
      const newTotalBreakTime = workSession.totalBreakTime + duration;
      await updateWorkSession(workSessionId, {
        totalBreakTime: newTotalBreakTime,
      });
    }

    return { breakSessionId: activeBreak.id, timeEntryId };
  }

  // Utility Methods
  static calculateWorkTime(clockInTime: Date, clockOutTime: Date, totalBreakTime: number): number {
    const totalTime = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));
    return Math.max(0, totalTime - totalBreakTime);
  }

  static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static getCurrentStatus(workSession: WorkSession | null, breakSession: BreakSession | null): 'working' | 'on_break' | 'offline' {
    if (!workSession || workSession.status === 'completed') {
      return 'offline';
    }
    if (breakSession && breakSession.status === 'active') {
      return 'on_break';
    }
    return 'working';
  }

  // Daily Summary Management
  static async updateDailySummary(employeeId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    const existingSummary = await getDailySummary(employeeId, dateStr);
    
    if (existingSummary) {
      // Update existing summary
      const workSessions = await this.getWorkSessionsForDate(employeeId, date);
      const totalWorkTime = workSessions.reduce((sum, session) => sum + session.totalWorkTime, 0);
      const totalBreakTime = workSessions.reduce((sum, session) => sum + session.totalBreakTime, 0);
      
      await updateDailySummary(existingSummary.id, {
        totalWorkTime,
        totalBreakTime,
        status: 'complete',
        overtime: Math.max(0, totalWorkTime - (8 * 60)), // 8 hours in minutes
      });
    } else {
      // Create new summary
      const workSessions = await this.getWorkSessionsForDate(employeeId, date);
      const totalWorkTime = workSessions.reduce((sum, session) => sum + session.totalWorkTime, 0);
      const totalBreakTime = workSessions.reduce((sum, session) => sum + session.totalBreakTime, 0);
      
      await createDailySummary({
        employeeId,
        date: dateStr,
        totalWorkTime,
        totalBreakTime,
        clockInTime: workSessions[0]?.clockInTime,
        clockOutTime: workSessions[0]?.clockOutTime,
        workSessions: workSessions.map(session => session.id),
        status: 'complete',
        overtime: Math.max(0, totalWorkTime - (8 * 60)),
      });
    }
  }

  private static async getWorkSessionsForDate(employeeId: string, date: Date): Promise<WorkSession[]> {
    // This would need to be implemented in the database service
    // For now, returning empty array
    return [];
  }
}
