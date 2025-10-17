/**
 * Client-side Time Tracking Service
 * Provides API-based time tracking operations for browser environment
 */

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

export class ClientTimeTrackingService {
  // Clock In Operations
  static async clockIn(data: ClockInData): Promise<{ workSessionId: string; timeEntryId: string }> {
    try {
      const response = await fetch('/api/time-tracking/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clock in');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to clock in:', error);
      throw error;
    }
  }

  // Clock Out Operations
  static async clockOut(data: ClockOutData): Promise<{ workSessionId: string; timeEntryId: string }> {
    try {
      const response = await fetch('/api/time-tracking/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clock out');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to clock out:', error);
      throw error;
    }
  }

  // Start Break
  static async startBreak(data: BreakData): Promise<{ breakSessionId: string; timeEntryId: string }> {
    try {
      const response = await fetch('/api/time-tracking/break-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start break');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to start break:', error);
      throw error;
    }
  }

  // End Break
  static async endBreak(workSessionId: string, notes?: string): Promise<{ breakSessionId: string; timeEntryId: string }> {
    try {
      const response = await fetch('/api/time-tracking/break-end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workSessionId, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end break');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to end break:', error);
      throw error;
    }
  }

  // Get Active Work Session
  static async getActiveWorkSession(employeeId: string): Promise<unknown> {
    try {
      const response = await fetch(`/api/time-tracking/active-work-session?employeeId=${employeeId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get active work session');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get active work session:', error);
      throw error;
    }
  }

  // Get Active Break Session
  static async getActiveBreakSession(workSessionId: string): Promise<unknown> {
    try {
      const response = await fetch(`/api/time-tracking/active-break-session?workSessionId=${workSessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get active break session');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get active break session:', error);
      throw error;
    }
  }
}
